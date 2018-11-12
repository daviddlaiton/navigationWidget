const datosJson = "./data/nbaTeams.json";
var data = null;
var selected = false;
var idSubListSelected = "";
var elementosMostrados = [];

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
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");


    ctx.font = "20px Arial";

    ctx.clearRect(0, 0, 50, 800);

    let lista = makeList();
    let num = data.length;

    let height = 800 / num;
    let width = 50;

    let currentLenght = 0;

    lista.map((d) => {
        //Numero de elementos dentro de la letra
        let subList = makeSubList(d);
        let size = subList.length;
        //Posición donde debe estar cada elemento nuevo dependiendo de la cantidad de elementos que lo componen.
        currentLenght = currentLenght + size;

        //Console.log para poder conocer todas las posiciones y conocer si estan correctas
        //console.log("height", height, "letra", d, "tamaño", size, "Pos", height * currentLenght - height * size, "rect1", (height * currentLenght), "pos letra", (size * height) / 2 + height * currentLenght - height * size);


        //Rectangulo
        ctx.rect(0, height * currentLenght - height * size, width, (height * size));
        //Texto
        ctx.fillText(d, 25 - 6, ((size * height + 15) / 2 + height * currentLenght - height * size));
        // ctx.rect(250,200,200,200);
        // ctx.fillText("Holanda", 305,300);

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

        if (selected) {
            selected = false;
            drawWidget();
        }
        else {
            selected = true;
        }
        drawSelected(event);
    }, false);
}

function drawSelected(event) {
    let x = event.offsetX,
        y = event.offsetY;

    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");

    elementosMostrados.map((d) => {
        let letra = d.split(";")[0];
        let bS = d.split(";")[1];
        let bI = d.split(";")[2];
        let texto = d.split(";")[3];
        let listaElementos = d.split(";")[4];

        if (x < 50 && y > bS && y < bI) {

            //Rellenar de color #3399ff el recuadro seleccionado
            ctx.beginPath();
            ctx.clearRect(0, bS, 50, bI - bS);
            ctx.rect(0, bS, 50, bI - bS);
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


        return null;
    });
}

function drawSelectedByLetter(letter) {

    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");

    if (selected) {
        drawWidget();
    }
    else {
        selected = true;
    }

    elementosMostrados.map((d) => {
        let letra = d.split(";")[0];
        let bS = d.split(";")[1];
        let bI = d.split(";")[2];
        let texto = d.split(";")[3];
        let listaElementos = d.split(";")[4];

        if (letra === letter) {

            //Rellenar de color #a8c6fa el recuadro seleccionado
            ctx.beginPath();
            ctx.clearRect(0, bS, 50, bI - bS);
            ctx.rect(0, bS, 50, bI - bS);
            ctx.fillStyle = "#a8c6fa";
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillText(letra, 25 - 6, texto);
        }


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

    $("#searchBarButton").click(function(){
        let searchBarValue = document.getElementById("outputcontent").innerHTML;
        if(searchBarValue !== ""){
            console.log(searchBarValue);
        }
        else{
            alert("Put some value")
        }
    })
}
);
