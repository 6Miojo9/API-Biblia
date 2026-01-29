const versao = document.getElementById("versao");
const livro = document.getElementById("livro");
const capitulo = document.getElementById("capitulo");
const versiculo = document.getElementById("versiculo");
const resposta = document.getElementById("resposta");
const url = "https://bible-api.com/";
const texto = document.createElement("div");
texto.id = "texto";
const loader = document.createElement('div');
loader.id = "loader";

inicio();

async function inicio() {  //1 //Função primaria, start na API com todas as versões.
    const dados = await requisita(`${url}data`, loader);
    for (let i = 0; i < dados.translations.length; i++) {
        inserirOption(versao, dados.translations[i].name, dados.translations[i].identifier);
    }
    atualizaLivros();
}

versao.addEventListener("change", function() {  //1  //Atualiza os livros ao selecionar a versão.
    livro.textContent = "";
    capitulo.textContent = "";
    versiculo.textContent = "";
    atualizaLivros();
});

async function atualizaLivros() {  //1 //Função para requisitar, criar e inserir no html a lista dinámica de dos nomes dos livros segundo a versão selecionado.
    const dados = await requisita(`${url}data/${versao.value}`, loader);
    for (let i = 0; i < dados.books.length; i++) {
        inserirOption(livro, dados.books[i].name, dados.books[i].id);
    }
    atualizaCapitulos();
}

livro.addEventListener("change", function(){  //1 //Atualiza a quantidade de capítulos ao selecionar o livros.
    capitulo.textContent = "";
    versiculo.textContent = "";
    atualizaCapitulos();
});

async function atualizaCapitulos(){  //1 //Função para requisitar, criar e inserir no html a lista dinámica de números de capítulos segundo o livro selecionado.
    const dados = await requisita(`${url}data/${versao.value}/${livro.value}`, loader);
    let option = document.createElement("option");
    option.textContent = "Todos";
    option.value = "";
    capitulo.appendChild(option);
    for (let i = 0; i < dados.chapters.length; i++) {
        inserirOption(capitulo, dados.chapters[i].chapter, dados.chapters[i].chapter);
    }
}

capitulo.addEventListener("change", function(){  //1 //Atualiza a quantidade de versículo ao selecionar o capítulo.
    versiculo.textContent = ""; 
    atualizaVersiculo();
});

async function atualizaVersiculo(){  //1 //Função para requisitar, criar e inserir no html a lista dinámica de números de versículos segundo o capítulo selecionado.
    const dados = await requisita(`${url}data/${versao.value}/${livro.value}/${capitulo.value}`, loader);
    let option = document.createElement("option");
    option.textContent = "Todos";
    option.value = "";
    versiculo.appendChild(option); 
    for (let i = 0; i < dados.verses.length; i++) {
        inserirOption(versiculo, dados.verses[i].verse, dados.verses[i].verse);
    }
}

async function inserirOption(select, name, id) {  //2  //Função que insere as options nos selects.
    let option = document.createElement("option");
    option.textContent = name;
    option.value = id;
    select.appendChild(option); 
}

async function requisita(url, loader) {  //2 //Função que faz a requisição na API.
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
        return await resposta.json();
    } catch (erro) {
        console.error("Erro:", erro.message);
        throw erro;
    } finally {
        loader.style.display = 'none';
    }
}

async function buscar(){  //3 //Função que requisita o livro, capítulo ou versículo, na API segundo os parâmetros.
    resposta.textContent = "";
    texto.textContent = "";
    let pesquisa = "";
    if(capitulo.value != ""){
        if(versiculo.value != ""){
            pesquisa = `${url}${livro.value}+${capitulo.value}:${versiculo.value}?translation=${versao.value}`;
        }else{
            pesquisa = `${url}${livro.value}+${capitulo.value}?translation=${versao.value}`;
        }
        const dados = await requisita(pesquisa, loader);
        nomeLivro();
        organizarCapitulo(dados.verses[0].chapter);
        for (let i = 0; i < dados.verses.length; i++) {
            textoVersiculos(dados, i);
        }
        
    }else{
        nomeLivro();
        loader.style.display = 'block';
        resposta.appendChild(loader);
        let caps = "1"
        for (let i = 2; i < capitulo.length; i++) {
            caps += "-" + i;
        }
        const dados = await requisita(`${url}${livro.value}${caps}?translation=${versao.value}`,loader);
        let textCap = 1;
        for (let e = 0; e < dados.verses.length; e++) {
            if(dados.verses[e].chapter == textCap){
                organizarCapitulo(textCap);
                textCap += 1;
            }
            textoVersiculos(dados, e);
        }
    }
}

function baixar() {  //3 //Baixa o elemento texto em PDF
    const opt = {
        margin: 0,
        filename: `${livro.options[livro.selectedIndex].textContent}-${capitulo.options[capitulo.selectedIndex].textContent}-${versiculo.value}.pdf`,
        image: {type: 'jpeg', quality: 1},
        html2canvas: {scale: 2, backgroundColor: "beige"},
        jsPDF: { unit: 'px', format: [800, 1200]},
        pagebreak: {mode: ['avoid-all', 'css', 'legacy']}
    };
    html2pdf().set(opt).from(texto).save();
}

async function nomeLivro(){  //4 //Função que cria e insere o nome do livro no html.
    let nome_livro = document.createElement("h1");
    nome_livro.textContent = livro.options[livro.selectedIndex].textContent;
    texto.appendChild(nome_livro);
}

async function organizarCapitulo(capitulo){  //4 //Função que cria e insere o capítulo no html.
    let h3 = document.createElement("h3");
    h3.textContent = "Capítulo: " + capitulo;
    texto.appendChild(document.createElement("br"));
    texto.appendChild(h3);
    texto.appendChild(document.createElement("br"));
}

async function textoVersiculos(dados, i) {  //4 //Função que cria e insere o número e texto do versículo no html.
    let linha = document.createElement("div");
    linha.id = "linha"
    let strong = document.createElement("strong");
    let p = document.createElement("p");
    strong.textContent = dados.verses[i].verse + ".";
    linha.appendChild(strong);
    p.textContent = dados.verses[i].text;
    linha.appendChild(p);
    texto.appendChild(linha);
    resposta.appendChild(texto);
}