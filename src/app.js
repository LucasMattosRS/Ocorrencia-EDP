// ============================================
// APP PRINCIPAL - EDP OCORRÊNCIA
// PARTE 1/3
// ============================================

class EDPOcorrenciaApp {

constructor(){

    this.loginEDP = {
        matricula:"",
        senha:""
    };

    this.generator = new BookmarkletGenerator(SGS_CONFIG);

    this.currentBookmarklet = "";

    this.init();

}



init(){

    this.bindEvents();

    this.loadSavedData();

    this.checkUrlParams();

}





bindEvents(){


document
.getElementById('btn-login')
?.addEventListener(
'click',
()=>this.loginSistema()
);



const form =
document.getElementById(
'form-ocorrencia'
);



if(form){

form.addEventListener(
'submit',
(e)=>this.handleSubmit(e)
);

}




document
.getElementById('btn-gerar')
?.addEventListener(
'click',
()=>this.gerarBookmarklet()
);




document
.getElementById('btn-abrir-sgs')
?.addEventListener(
'click',
()=>this.abrirSGS()
);




document
.getElementById('btn-imprimir')
?.addEventListener(
'click',
()=>this.imprimirConfirmacao()
);




document
.getElementById('btn-copiar')
?.addEventListener(
'click',
()=>this.copiarBookmarklet()
);




document
.getElementById('btn-compartilhar')
?.addEventListener(
'click',
()=>this.compartilharWhatsApp()
);




document
.getElementById('btn-confirmar-sim')
?.addEventListener(
'click',
()=>this.confirmarEnvio()
);




document
.getElementById('btn-confirmar-nao')
?.addEventListener(
'click',
()=>this.voltar()
);




document
.getElementById('btn-voltar')
?.addEventListener(
'click',
()=>this.voltar()
);




document
.getElementById('btn-limpar')
?.addEventListener(
'click',
()=>this.limpar()
);





document
.querySelectorAll(
'#descricao,#cpf,#endereco'
)
.forEach(el=>{


el.addEventListener(
'input',
()=>this.autoSave()
);


});





document
.querySelectorAll(
'input[name="machucado"],#tipo-evento,#categoria-tipologia,#tipo-tipologia'
)
.forEach(el=>{


el.addEventListener(
'change',
()=>this.autoSave()
);


});





document
.getElementById('btn-localizacao')
?.addEventListener(
'click',
()=>this.obterLocalizacao()
);


}





// ============================================
// LOGIN SGS
// ============================================


loginSistema(){


const matricula =
document
.getElementById('matricula')
?.value
.trim();



const senha =
document
.getElementById('senha')
?.value
.trim();




if(!matricula || !senha){

this.showToast(
"⚠️ Informe matrícula e senha",
"warning"
);

return;

}



this.loginEDP = {

matricula

};




this.showScreen(
"screen-form"
);



this.showToast(
"✅ Login informado",
"success"
);



}





// ============================================
// FORMULÁRIO
// ============================================


handleSubmit(e){

e.preventDefault();

this.gerarBookmarklet();

}





gerarBookmarklet(){


const descricao =
document
.getElementById('descricao')
.value
.trim();



const endereco =
document
.getElementById('endereco')
.value
.trim();



const cpf =
document
.getElementById('cpf')
.value
.trim();



const machucado =
document
.querySelector(
'input[name="machucado"]:checked'
)
?.value || "";



const tipoEvento =
document
.getElementById('tipo-evento')
.value;



const categoria =
document
.getElementById('categoria-tipologia')
.value;



const tipoTipologia =
document
.getElementById('tipo-tipologia')
.value;





if(!cpf){

this.showToast(
"⚠️ Preencha o CPF!",
"warning"
);

return;

}



if(!descricao){

this.showToast(
"⚠️ Preencha a descrição!",
"warning"
);

return;

}



if(!endereco){

this.showToast(
"⚠️ Preencha o endereço!",
"warning"
);

return;

}



if(!tipoEvento){

this.showToast(
"⚠️ Selecione o Tipo de Evento!",
"warning"
);

return;

}



if(!categoria){

this.showToast(
"⚠️ Selecione a Categoria!",
"warning"
);

return;

}



if(!tipoTipologia){

this.showToast(
"⚠️ Selecione a Tipologia!",
"warning"
);

return;

}



this.currentBookmarklet =
this.generator.generateBookmarklet(
descricao,
endereco,
cpf,
machucado,
tipoEvento,
categoria,
tipoTipologia
);



this.showScreen(
"screen-resultado"
);



document
.getElementById('res-cpf')
.textContent = cpf;



document
.getElementById('res-descricao')
.textContent = descricao;



document
.getElementById('res-endereco')
.textContent = endereco;



document
.getElementById('res-tipo-evento')
.textContent = tipoEvento;



document
.getElementById('res-machucado')
.textContent = machucado;



this.saveData({

descricao,
endereco,
cpf,
machucado,
tipoEvento,
categoria,
tipoTipologia,
timestamp:new Date().toISOString()

});



this.showToast(
"✅ Link gerado com sucesso!",
"success"
);


}
// ============================================
// APP PRINCIPAL - EDP OCORRÊNCIA
// PARTE 2/3
// ============================================


// ============================================
// AÇÕES
// ============================================


abrirSGS(){


if(!this.currentBookmarklet){

this.showToast(
"❌ Gere o link primeiro!",
"warning"
);

return;

}



window.open(
SGS_CONFIG.URL_BASE,
"_blank"
);



this.copyToClipboard(
this.currentBookmarklet
);



this.showToast(
"📋 Código copiado! Cole no SGS",
"success"
);



}





confirmarEnvio(){


if(!this.currentBookmarklet){

this.showToast(
"❌ Gere o link primeiro!",
"warning"
);

return;

}



this.showToast(
"✅ Confirmado!",
"success"
);



this.abrirSGS();



}





imprimirConfirmacao(){


window.print();


}





copiarBookmarklet(){


if(!this.currentBookmarklet){

this.showToast(
"❌ Gere o link primeiro!",
"warning"
);

return;

}



this.copyToClipboard(
this.currentBookmarklet
);



this.showToast(
"📋 Código copiado!",
"success"
);



}





compartilharWhatsApp(){



const descricao =
document
.getElementById('descricao')
.value;



const endereco =
document
.getElementById('endereco')
.value;



const mensagem =

`📋 *Nova Ocorrência SGS EDP*

Descrição:
${descricao}

Endereço:
${endereco}

Abrir SGS:
${SGS_CONFIG.URL_BASE}`;



const url =

"https://wa.me/?text=" +
encodeURIComponent(mensagem);



window.open(
url,
"_blank"
);



}





// ============================================
// UTILIDADES
// ============================================


copyToClipboard(text){


if(
navigator.clipboard &&
window.isSecureContext
){


navigator.clipboard.writeText(text);


}

else{


const textarea =
document.createElement(
"textarea"
);



textarea.value = text;



document.body.appendChild(
textarea
);



textarea.select();



document.execCommand(
"copy"
);



textarea.remove();


}


}





showScreen(id){


document
.querySelectorAll(".screen")
.forEach(screen=>{


screen.classList.remove(
"active"
);


});



document
.getElementById(id)
?.classList.add(
"active"
);



window.scrollTo(
0,
0
);


}





voltar(){


this.showScreen(
"screen-form"
);


}





limpar(){


document
.getElementById("descricao")
.value = "";



document
.getElementById("cpf")
.value = "";



document
.getElementById("endereco")
.value = "";



document
.getElementById("tipo-evento")
.value = "";



document
.getElementById("categoria-tipologia")
.value = "";



document
.getElementById("tipo-tipologia")
.value = "";



const radio =
document.querySelector(
'input[value="Não"]'
);



if(radio){

radio.checked = true;

}



localStorage.removeItem(
"edp_ocorrencia_draft"
);



this.showToast(
"🧹 Formulário limpo!",
"success"
);


}





// ============================================
// GEOLOCALIZAÇÃO
// ============================================


obterLocalizacao(){


if(!navigator.geolocation){


this.showToast(
"❌ Geolocalização não suportada",
"warning"
);


return;

}



const btn =
document.getElementById(
"btn-localizacao"
);



btn.disabled = true;

btn.innerHTML =
"⏳ Buscando...";




navigator.geolocation.getCurrentPosition(


(position)=>{


const lat =
position.coords.latitude;



const lng =
position.coords.longitude;




this.reverseGeocode(
lat,
lng
)
.then(endereco=>{


if(endereco){


document
.getElementById("endereco")
.value = endereco;


}


})
.finally(()=>{


btn.disabled = false;


btn.innerHTML =
"📍 Usar Localização Atual";



this.showToast(
"📍 Localização encontrada!",
"success"
);



});


},



()=>{


btn.disabled = false;


btn.innerHTML =
"📍 Usar Localização Atual";



this.showToast(
"❌ Erro localização",
"warning"
);



},



{

enableHighAccuracy:true,

timeout:10000

}



);



}





async reverseGeocode(lat,lng){


try{


const response =
await fetch(

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

);



const data =
await response.json();



return data.display_name || "";



}

catch(e){

return "";

}


}
// ============================================
// APP PRINCIPAL - EDP OCORRÊNCIA
// PARTE 3/3
// ============================================


// ============================================
// SALVAR DADOS
// ============================================


autoSave(){


const dados = {


descricao:
document
.getElementById("descricao")
.value,



cpf:
document
.getElementById("cpf")
.value,



endereco:
document
.getElementById("endereco")
.value,



tipoEvento:
document
.getElementById("tipo-evento")
.value,



categoria:
document
.getElementById("categoria-tipologia")
.value,



tipoTipologia:
document
.getElementById("tipo-tipologia")
.value,



machucado:
document
.querySelector(
'input[name="machucado"]:checked'
)
?.value || ""


};



localStorage.setItem(

"edp_ocorrencia_draft",

JSON.stringify(dados)

);


}





loadSavedData(){


try{


const dados =

JSON.parse(

localStorage.getItem(
"edp_ocorrencia_draft"
)

);



if(!dados){

return;

}




document
.getElementById("descricao")
.value =
dados.descricao || "";



document
.getElementById("cpf")
.value =
dados.cpf || "";



document
.getElementById("endereco")
.value =
dados.endereco || "";



document
.getElementById("tipo-evento")
.value =
dados.tipoEvento || "";



document
.getElementById("categoria-tipologia")
.value =
dados.categoria || "";



document
.getElementById("tipo-tipologia")
.value =
dados.tipoTipologia || "";





const radio =

document.querySelector(

`input[name="machucado"][value="${dados.machucado}"]`

);



if(radio){

radio.checked = true;

}



}

catch(e){

console.error(
"Erro carregar dados:",
e
);

}


}





saveData(data){



let historico =


JSON.parse(

localStorage.getItem(
"edp_ocorrencia_history"
) || "[]"

);




historico.unshift(data);




if(historico.length > 50){

historico.pop();

}




localStorage.setItem(

"edp_ocorrencia_history",

JSON.stringify(historico)

);


}





// ============================================
// PARAMETROS URL
// ============================================


checkUrlParams(){



const params =

new URLSearchParams(

window.location.search

);



const mapa = {


descricao:"descricao",

endereco:"endereco",

cpf:"cpf",

tipoEvento:"tipo-evento",

categoria:"categoria-tipologia",

tipoTipologia:"tipo-tipologia",

machucado:"machucado"


};




Object.keys(mapa)

.forEach(param=>{



const valor =
params.get(param);



if(valor){



const campo =

document.getElementById(
mapa[param]
);



if(campo){


campo.value =

decodeURIComponent(valor);


}



}



});



}





// ============================================
// TOAST
// ============================================


showToast(
message,
type="success"
){



const toast =

document.getElementById(
"toast"
);



if(!toast){

return;

}



toast.textContent =
message;



toast.className =
"toast show";




if(type==="warning"){


toast.style.background =
"#ffaa00";

toast.style.color =
"#1a1a2e";


}

else{


toast.style.background =
"#00ff88";

toast.style.color =
"#1a1a2e";


}




setTimeout(()=>{


toast.classList.remove(
"show"
);



},3000);



}



}





// ============================================
// INICIAR APP
// ============================================


document.addEventListener(

"DOMContentLoaded",

()=>{


window.app =

new EDPOcorrenciaApp();



}

);