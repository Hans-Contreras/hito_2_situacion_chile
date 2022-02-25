// Se incluye async/await para esperar ls resolución de la promesa del postData
$('#js-form-login').submit(async (e) => {
    // también se incluye preventDefault() para evitar que el navegador se refresque en cada click
    e.preventDefault();

    // Se define las constantes para solicitar el email y password por medio de formulario
    const email = document.getElementById('js-input-email').value
    const password = document.getElementById('js-input-password').value

    // Se recibe el Token
    const JWT = await postData(email, password);

});

// Se realiza el llamado a la API
/* El metodo fetch() hace el llamado a la api que retorna una promesa,a demás se añade la funcion postData la cual
   al hacer el login e ingresar un email y password válidos retorna un token de acceso a la api. */
const postData = async (email, password) => {
    try {
        const response = await fetch('http://localhost:3000/api/login',
            {
                method: 'POST',
                //El metodo post es util cuando el usuario requere rellenar contraseñas o alguna info confidencial
                body: JSON.stringify({ email: email, password: password })
                //El método JSON.stringify() convierte un objeto o valor de JavaScript en una cadena de texto JSON,
            })
        const { token } = await response.json()

        /* Se utiliza localStorage.setItem para almacenar el JWT al momento de loguear, de manera que persista el token
           localStorage.setItem​ ('llave-para-identificar', 'valor-que-guardamos') 
         */
        // Se agrega función if que Valida que los datos ingresados son correctos
        if (response.status == 422) {
            //La instrucción throw le permite crear un error personalizado.
            throw new Error('Datos incorrectos');
        } else {
            //Persistir el token utilizando localStorage.  
            localStorage.setItem('jwt-token', token);
            alternarPagina()
            console.log('postData token: ' + token);
            return token;
        }
    //Se especifica el error por medio de catch    
    } catch (error) {
        alert("Datos Incorrectos")
        console.error(`Error: ${error}`);
    }
}
//Se define una constante que permite ocultar y mostrar en el navbar las opciones luego de loguearse, 
//en caso de existir un token jwt
const alternarPagina = () => {
    $("#formModal").modal("hide");
    $("#js-link-login").toggle();
    $("#js-link-chile").toggle();
    $("#js-link-logout").toggle();
};

//Aquí, en caso de existir el token se asocia al boton "Situación Chile", mostrar el gráfico de línea y ocultar la demás información
$('#js-link-chile').on('click', function () {
    const token = localStorage.getItem('jwt-token');
    $("#js-myChartChile").show();
    $("#chartContainer-casos").hide();
    $("#js-tabla-casos").hide();
});

//Aquí, se asocia al boton "Home", ocultar el gráfico de línea y mostrar la estrutura inicial del documento html,
//con el gráfico de barras por pais y la tabla de casos
$('#js-link-home').on('click', function () {
    const token = localStorage.getItem('jwt-token');
    $("#js-myChartChile").hide();
    $("#chartContainer-casos").show();
    $("#js-tabla-casos").show();

});

//Al hacer click en la opción Situación Chile, crea el llamado a las APIs.
const urlChile = {
    confirmed: 'http://localhost:3000/api/confirmed',
    deaths: 'http://localhost:3000/api/deaths',
    recovered: 'http://localhost:3000/api/recovered',
}

/*Se define una comstante que en caso de existir el token, llama a una promesa la que arroja 
como respuesta la constante "DrawChileChart" que es la que llama los datos de las api*/

const getChileInfo = () => {
    const token = localStorage.getItem('jwt-token')
    const data = Promise.all([
        'http://localhost:3000/api/confirmed',
        'http://localhost:3000/api/deaths',
        'http://localhost:3000/api/recovered'
    ].map(url =>
        fetch(url, { method:'GET', 
        headers: {
            Authorization: `Bearer ${token}`
        }}).then(resp => resp.json())
    ))

    .then(response => {
        console.log(response)
        drawChileChart(response)
    })
    .catch(error => {
        console.error(error)
        localStorage.clear()
    })
}


getChileInfo()
console.log(getChileInfo())

// Aquí, se definen las constantes que llaman a los array de datos de los casos, por medio de map.
const drawChileChart = (response) => {
    const label = response[0].data.map((fechas) => fechas.date)
    const dataConfirmados = response[0].data.map((confirmados) => confirmados.total)
    const dataMuertos = response[1].data.map((muertos) => muertos.total)
    const dataRecuperados = response[2].data.map((recuperados) => recuperados.total)
    console.log(dataConfirmados)
    console.log(dataMuertos)
    console.log(dataRecuperados)

    //Aqui crea la constante que mostrará el el gráfico de línea en el documento html
    //y se define la estructura del chart o gráfico de línea con la información de los casos.
    const myChart = document.getElementById('myChartChile')
    new Chart(myChart,
        {
            type: 'line',
            data: {
                labels: label,
                datasets: [{
                    label: 'Confirmados',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: dataConfirmados,
                },
                {
                    label: 'Muertes',
                    backgroundColor: 'rgb(25, 50, 20)',
                    borderColor: 'rgb(25, 50, 20)',
                    data: dataMuertos,
                },
                {
                    label: 'Recuperados',
                    backgroundColor: 'rgb(85, 50, 200)',
                    borderColor: 'rgb(85, 50, 200)',
                    data: dataRecuperados,
                  }]
              },
            options: {}
          }
      );
}


// Se define una función para validar si existe un JWT en la página.
// de ser asi se deberia llamar automaticamente a nuestra API y 
// mostrar la navbar alterna con las opciones definidas una vez logueados (home, situación-chile, cerrar sesión)
const init = async () => {
    const token = localStorage.getItem('jwt-token')
    if (token) {
        alternarPagina()
    }
}
init()

//Se crea la funcionalidad para el botón de Cerrar sesión en el navbar.
$('#js-link-logout').on('click', function () {
    localStorage.removeItem('jwt-token');
    location.reload();
});

