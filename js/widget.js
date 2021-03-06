function widget(file, heightP, widthP) {
    var datosJson = file;
    var data = null;
    var idSubListSelected = "";
    var elementosMostrados = [];
    var heightCanvas = heightP;
    var width = widthP;

    d3.json(datosJson).then(datos => {
        data = datos;
        drawWidget();
        subList();

        $(function () {
            var currencies = allElements();

            // setup autocomplete function pulling from currencies[] array
            $('#autocomplete').autocomplete({
                lookup: currencies,
                onSelect: function (suggestion) {
                    var thehtml = suggestion.value;
                    $('#outputcontent').html(thehtml);
                }
            });

        });
    });

    function drawWidget() {
        let c = document.getElementById("list");
        let ctx = c.getContext("2d");


        ctx.font = "20px Arial";

        ctx.clearRect(0, 0, 100, heightCanvas);

        let lista = makeList();
        let num = data.length;

        let height = heightCanvas / num;

        let currentLenght = 0;

        lista.map((d) => {
            //Numero de elementos dentro de la letra
            let subList = makeSubList(d);
            let size = subList.length;
            //Posición donde debe estar cada elemento nuevo dependiendo de la cantidad de elementos que lo componen.
            currentLenght = currentLenght + size;

            //Rectangulo
            ctx.rect(0, height * currentLenght - height * size, width, (height * size));
            //Texto
            ctx.fillText(d, 25 - 6, ((size * height + 15) / 2 + height * currentLenght - height * size));

            //Añadir elementos a arreglo para cuando se haga click mostrarlos correctamente
            let bordeSuperior = height * currentLenght - height * size;
            let bordeInferior = height * currentLenght;
            let texto = ((size * height) / 2 + height * currentLenght - height * size);
            let anadir = d + ";" + bordeSuperior + ";" + bordeInferior + ";" + texto + ";" + subList;
            elementosMostrados.push(anadir);
            return null;
        })

        ctx.stroke();
        c.addEventListener("click", function (event) {


            drawWidget();
            drawSelected(event);
        }, false);
    }

    function drawSelected(event) {
        let x = event.offsetX,
            y = event.offsetY;

        let c = document.getElementById("list");
        let ctx = c.getContext("2d");

        elementosMostrados.map((d) => {
            let letra = d.split(";")[0];
            let bS = d.split(";")[1];
            let bI = d.split(";")[2];
            let texto = d.split(";")[3];
            let listaElementos = d.split(";")[4];

            if (x < width && y > bS && y < bI) {

                //Rellenar de color #3399ff el recuadro seleccionado
                ctx.beginPath();
                ctx.clearRect(0, bS, width, bI - bS);
                ctx.rect(0, bS, width, bI - bS);
                ctx.fillStyle = "#3399ff";
                ctx.fill();
                ctx.fillStyle = "black";
                ctx.fillText(letra, 25 - 6, texto);

                //Scroll to the first word of the selected letter
                let listaSplit = listaElementos.split(",");
                let arrayOfWords = listaSplit[0].split(" ");
                let idToScrool = "";
                arrayOfWords.map((word) => {
                    idToScrool = idToScrool + word;
                });
                $("#subList").animate({
                    scrollTop: $("#" + idToScrool).position().top
                }, "slow");

                if (idSubListSelected !== "") {
                    let subListSelected = document.getElementById(idSubListSelected);
                    subListSelected.style.backgroundColor = "white";
                }
                let toWhite = document.getElementById(idToScrool);
                toWhite.style.backgroundColor = "#3399ff";
                idSubListSelected = idToScrool;

            }

            updateSelected();
            return null;
        });
    }

    function drawSelectedByLetter(letter) {

        let c = document.getElementById("list");
        let ctx = c.getContext("2d");

        drawWidget();

        elementosMostrados.map((d) => {
            let letra = d.split(";")[0];
            let bS = d.split(";")[1];
            let bI = d.split(";")[2];
            let texto = d.split(";")[3];
            if (letra === letter) {

                //Rellenar de color #3399ff el recuadro seleccionado
                ctx.beginPath();
                ctx.clearRect(0, bS, width, bI - bS);
                ctx.rect(0, bS, width, bI - bS);
                ctx.fillStyle = "#3399ff";
                ctx.fill();
                ctx.fillStyle = "black";
                ctx.fillText(letra, 25 - 6, texto);

            }
            updateSelected();
            return null;
        });

    }


    function makeList() {

        let datos = [];
        let iterador = 0;

        while (iterador < data.length) {
            let value = data[iterador].dimension_value.charAt(0);
            if (!datos.includes(value)) {
                datos.push(value);
            }

            iterador = iterador + 1;
        }

        return datos;
    }

    function makeSubList(initialLetter) {

        let iterador = 0;
        let resp = [];

        while (iterador < data.length) {
            let value = data[iterador].dimension_value;
            if (value.startsWith(initialLetter)) {
                resp.push(value);
            }
            iterador++;
        }
        return resp;

    }

    function subList() {
        let ul = document.getElementById("subList");

        let lista = makeList();
        lista.map((letra) => {
            let subList = makeSubList(letra);
            subList.map((palabra) => {
                let li = document.createElement("li");
                let arrayOfWords = palabra.split(" ");
                let id = "";
                arrayOfWords.map((word) => {
                    id = id + word;
                });
                li.setAttribute("id", id);
                li.appendChild(document.createTextNode(palabra));
                ul.appendChild(li);
            })
        });


    }

    function allElements() {
        let allElements = [];

        let allLetters = makeList();

        allLetters.map((letter) => {
            let currentElements = makeSubList(letter);
            allElements.push.apply(allElements, currentElements);
        });

        return allElements;
    }

    function updateSelected() {
        let innerText = document.getElementById(idSubListSelected).innerHTML;
        let imageURL = "";
        data.map((d) => {
            if (d.dimension_value === innerText) {
                imageURL = d.URL;
            }
        });
        $("#selectedElement").attr("src", imageURL);
    }

    $(document).ready(function () {
        $("ul.subList").click(function (e) {
            let liSelected = document.getElementById(e.toElement.id);
            if (idSubListSelected !== "") {
                let subListSelected = document.getElementById(idSubListSelected);
                subListSelected.style.backgroundColor = "white";
            }
            liSelected.style.backgroundColor = "#3399ff";
            idSubListSelected = liSelected.id;
            let letter = idSubListSelected.charAt(0);
            drawSelectedByLetter(letter);
        });

        $("#searchBarButton").click(function () {
            let searchBarValue = document.getElementById("outputcontent").innerHTML;
            if (searchBarValue !== "") {
                let arrayOfWords = searchBarValue.split(" ");
                let idToScrool = "";
                arrayOfWords.map((word) => {
                    idToScrool = idToScrool + word;
                });
                $("#subList").animate({
                    scrollTop: $("#" + idToScrool).position().top
                }, "slow");

                if (idSubListSelected !== "") {
                    let subListSelected = document.getElementById(idSubListSelected);
                    subListSelected.style.backgroundColor = "white";
                }
                let toWhite = document.getElementById(idToScrool);
                toWhite.style.backgroundColor = "#3399ff";
                idSubListSelected = idToScrool;
                drawSelectedByLetter(searchBarValue.charAt(0));
            }
            else {
                alert("Put some value")
            }
        })
    }
    );

}