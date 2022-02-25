
//Consumo de la API ​http://localhost:3000/api/total​
//Consumo de la API http://localhost:3000/api/countries​

// CLOSURE
let urlTotal = "http://localhost:3000/api/total";
let urlPais = "http://localhost:3000/api/countries";

//Petición por método fetch de JavaScript
const getPostData = () => {
   fetch(urlTotal)
      .then((response) => response.json())
      .then((myJson) => {
         let { data } = myJson;
         

//Se filtran los paises con mas de 10000 muertes
         let muertesTotales = data.filter((data) => {
            return data.deaths > 10000;
         });

//Se Despliega la información en una tabla
         const tabla = muertesTotales.map((casos) =>
            `<tr>
            <td>${casos.location}</td>
            <td>${casos.confirmed}</td>
            <td>${casos.deaths}</td>
            <td>${casos.recovered}</td>
            <td>${casos.active}</td>
            <td><a class="js-modal-detalles" country-location="${casos.location}" 
            href="#" data-toggle="modal" data-target="#detalleModalPais" >Ver detalle pais</a></td>
         </tr>`
         ).join('');
// Se inserta la tabla en el documento, se manipula el DOM mediante la id
         document.getElementById("insertar-tabla").innerHTML = tabla;


// Se Despliega la informacion en un grafico
         let grafico = muertesTotales.filter((data) => {
            return data.deaths > 100000;
         });

         let mostrarGrafico = grafico.map((casos) => ({ y: casos.deaths, label: casos.location }))

         var chart = new CanvasJS.Chart("chartContainer-casos", {
            animationEnabled: true,
            exportEnabled: true,
            theme: "dark2",
            title: {
               text: "Paises con mas de 100.000 Muertes"
            },
            axisY: {
               includeZero: true
            },
            data: [{
               type: "column",
               indexLabelFontColor: "#5A5757",
               indexLabelFontSize: 16,
               indexLabelPlacement: "outside",
               dataPoints: mostrarGrafico
            }]
         });
         chart.render();

      });
};
const initSituacionMundial = (async () => {
   getPostData();
})();


// Generar Modal y despliegue de Grafico por pais
const getPostPais = (pais) => {
// Se limita data a valores json
   fetch(`${urlPais}/${pais}`)
      .then((response) => response.json())
      .then((myJson) => {
         let { data } = myJson;

        //Se llama a los datos de los casos
         let confirmados = data.confirmed
         console.log(confirmados);
         let muertos = data.deaths
         let recuperados = data.recovered
         let activos = data.active

         // Se define la constante mostrarDetallePais, que contiene los nombres a mostrar en el grafico
         let mostrarDetallePais = [{ y: confirmados, name: "confirmados"},
                                   { y: muertos, name: "muertos"},
                                   { y: recuperados, name: "recuperados"},
                                   { y: activos, name: "activos"}]
         console.log(mostrarDetallePais);

         // Se define la constante modalCovidChart, que despliega el grafico en el documento html
         const modalCovidChart =  document.getElementById("chartContainer-pais")
         console.log(modalCovidChart)
         
         // Se define la estructura del gráfico CanvasJS que se mostrará por medio del modal con la información definida anteriomente
         var chart = new CanvasJS.Chart(modalCovidChart, {
            theme: "dark2",
            exportFileName: "Doughnut Chart",
            exportEnabled: true,
            animationEnabled: true,
            title: {
               text: `Detalle de ${pais} `
            },
            legend: {
               cursor: "pointer",
               itemclick: explodePie
            },
            data: [{
               type: "doughnut",
               innerRadius: 90,
               showInLegend: true,
               toolTipContent: "<b>{name}</b>: ${y} (#percent%)",
               indexLabel: "{name} - #percent%",
               dataPoints: mostrarDetallePais 
            }]
         });
         chart.render();

         function explodePie(e) {
            if (typeof (e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
               e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
            } else {
               e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
            }
            e.chart.render();
         }

      });
};

// Aquí se agrega la funcionalidad de la opción mostrar detalles en la tabla de casos
$('#insertar-tabla').on("click", "a.js-modal-detalles", function (e) {
   e.preventDefault()
   let pais = this.getAttribute('country-location')
   console.log(pais);
   getPostPais(pais);
});