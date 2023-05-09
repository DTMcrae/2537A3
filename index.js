const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let filters = [];
let numPages = 0;


const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty()

    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(startPage + 4, numPages);

    if(endPage - startPage < 4 && endPage - 4 > 1) startPage = (endPage - 4);

    if(currentPage != 1)
    {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="1">First</button>
    `);
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Prev</button>
    `);
    }


    for (let i = startPage; i <= endPage; i++) {
        if(i == currentPage)
        {
            $('#pagination').append(`
            <button class="btn btn-primary disabled page ml-1 numberedButtons" value="${i}">${i}</button>
            `);
        }
        else
        {
            $('#pagination').append(`
            <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
            `);
        }
    }
    if(currentPage != numPages)
    {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
    `);
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${numPages}">Last</button>
    `);
    }

}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
    selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    $('#pokeCards').empty();
    $('#pokeCount').empty();

    var pokeCounter = 0;

    selected_pokemons.forEach(async (pokemon) => {
        pokeCounter++;
        const res = await axios.get(pokemon.url);
        $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
    });

    $('#pokeCount').append(`
        <h3>Displaying ${pokeCounter} of ${pokemons.length}</h3>
    `)
}

const filter = async () => {
    var filtered_pokemons = [];

    if (filters.length > 0) {
        var filtered_lists = [];
        for(var i = 0; i < filters.length; i++)
        {
            let response = await axios.get(`https://pokeapi.co/api/v2/type/${filters[i]}`);
            filtered_lists.push(response.data.pokemon);
        }

        if(filtered_lists.length > 1)console.log(filtered_lists[1].map((pokemon) => pokemon.pokemon));
        for(var x = 0; x < filtered_lists[0].length; x++)
        {
            var result = true;
            let pokemon = filtered_lists[0][x].pokemon;
            for(var y = 1; y < filtered_lists.length; y++)
            {
                if (!filtered_lists[y].map((pokemon) => pokemon.pokemon.name).includes(pokemon.name)) result = false;
            }

            if(result)
            {
                filtered_pokemons.push(pokemon);
            }
        }
    }
    else
    {
        let res = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=810`);
        filtered_pokemons = res.data.results;
    }

    pokemons = filtered_pokemons;

    numPages = Math.ceil(pokemons.length / PAGE_SIZE);

    console.log("Numpages: " + numPages);

    currentPage = 1;
    paginate(1, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, numPages)
}

const setup = async () => {
    // test out poke api using axios here

    $('#pokeTypes').empty();
    let typeResponse = await axios.get('https://pokeapi.co/api/v2/type');
    let pokeTypes = typeResponse.data.results;
    pokeTypes.forEach( (type) => {
        var typeName = type.name;
        $('#pokeTypes').append(`
        <div class="btn-group-toggle pokeType" data-toggle="buttons">
            <label class="btn btn-secondary" id="${typeName}">
                <input type="checkbox"> ${typeName.toUpperCase()}
            </label>
        </div>
        `);
    });


    $('#pokeCards').empty();
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    pokemons = response.data.results;


    paginate(currentPage, PAGE_SIZE, pokemons)
    numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages)


    // pop up modal when clicking on a pokemon card
    // add event listener to each pokemon card
    $('body').on('click', '.pokeCard', async function (e) {
        const pokemonName = $(this).attr('pokeName')
        // console.log("pokemonName: ", pokemonName);
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        // console.log("res.data: ", res.data);
        const types = res.data.types.map((type) => type.type.name)
        console.log("types: ", types);
        $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
        $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
    })

    //add event listener to filters
    $('body').on('click', '.pokeType', async function(e) {
        console.log("Clicked: " + e.target.id);
        console.log("Status: " + e.target.children[0].checked);

        if(!e.target.children[0].checked)
        {
            filters.push(e.target.id);
        }
        else
        {
            filters.splice(filters.indexOf(e.target.id),1);
        }

        console.log(filters);
        filter();
    })

    // add event listener to pagination buttons
    $('body').on('click', ".numberedButtons", async function (e) {
        currentPage = Number(e.target.value)
        paginate(currentPage, PAGE_SIZE, pokemons)

        //update pagination buttons
        updatePaginationDiv(currentPage, numPages)
    })

}


$(document).ready(setup)