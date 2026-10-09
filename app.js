const KEY = "edvi_aurora_pdv_v1";
const defaultState = {
  settings:{storeName:"EdVi Aurora Makeup", slogan:"Realce sua beleza, ilumine sua essência.", minPrice:10, currency:"BRL"},
  products:[
    {id:"p1",name:"Gloss labial",sku:"GLOSS001",category:"Lábios",price:10,cost:4,stock:12,minStock:3},
    {id:"p2",name:"Batom cremoso",sku:"BATOM001",category:"Lábios",price:15,cost:6,stock:8,minStock:3},
    {id:"p3",name:"Esponja de maquiagem",sku:"ESP001",category:"Acessórios",price:10,cost:3.5,stock:10,minStock:3},
    {id:"p4",name:"Lápis para olhos",sku:"LAPIS001",category:"Olhos",price:10,cost:3.8,stock:7,minStock:2},
    {id:"p5",name:"Blush compacto",sku:"BLUSH001",category:"Rosto",price:20,cost:9,stock:5,minStock:2},
    {id:"p6",name:"Pincel de maquiagem",sku:"PINCEL001",category:"Acessórios",price:15,cost:6,stock:8,minStock:2}
  ],
  customers:[{id:"c1",name:"Cliente balcão",phone:"",email:"",notes:"Cliente padrão"}],
  sales:[],expenses:[],cash:{open:false,opening:0,openedAt:null,history:[]}
};
let state = loadState();
let currentPage = "dashboard";
let cart = [];
let productFilter = "";
let customerFilter = "";
let salesFilter = "";
let expenseFilter = "";

function loadState(){
  try { const saved = localStorage.getItem(KEY); if(saved){ const parsed=JSON.parse(saved); return {...structuredClone(defaultState),...parsed,settings:{...defaultState.settings,...parsed.settings},cash:{...defaultState.cash,...parsed.cash}}; } }
  catch(e){ console.warn("Não foi possível carregar os dados locais",e); }
  return structuredClone(defaultState);
}
function saveState(){ localStorage.setItem(KEY,JSON.stringify(state)); }
function uid(prefix="id"){ return prefix+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function money(n){ return (Number(n)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function dateTime(v){ if(!v)return "—"; return new Date(v).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}); }
function dateOnly(v){ if(!v)return "—"; return new Date(v).toLocaleDateString("pt-BR"); }
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){ const el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2600); }
function titleFor(page){return ({dashboard:"Visão geral",pdv:"Frente de caixa",products:"Produtos",customers:"Clientes",sales:"Vendas",expenses:"Despesas",reports:"Relatórios",settings:"Configurações"})[page]||"EdVi Aurora";}
function goto(page){currentPage=page;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));document.getElementById("pageTitle").textContent=titleFor(page);render();}
document.getElementById("mainNav").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)goto(b.dataset.page);});
document.addEventListener("click",e=>{const b=e.target.closest("[data-goto]");if(b)goto(b.dataset.goto);});
document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
document.addEventListener("keydown",e=>{if(e.key==="F4"){e.preventDefault();goto("pdv")} if(e.key==="Escape")closeModal();});
function render(){ const root=document.getElementById("pageContent"); const views={dashboard:renderDashboard,pdv:renderPDV,products:renderProducts,customers:renderCustomers,sales:renderSales,expenses:renderExpenses,reports:renderReports,settings:renderSettings}; root.innerHTML=(views[currentPage]||renderDashboard)(); bindPage(); }
function lowStock(){return state.products.filter(p=>Number(p.stock)<=Number(p.minStock));}
function renderDashboard(){
 const today=new Date().toDateString(), todays=state.sales.filter(s=>new Date(s.date).toDateString()===today);
 const revenue=todays.reduce((a,s)=>a+s.total,0), allRevenue=state.sales.reduce((a,s)=>a+s.total,0);
 const costs=state.sales.reduce((a,s)=>a+s.items.reduce((n,i)=>n+i.cost*i.qty,0),0);
 const exp=state.expenses.reduce((a,e)=>a+e.amount,0);
 const recent=[...state.sales].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
 return `<div class="dashboard-welcome"><div><div class="eyebrow">BEM-VINDA À SUA LOJA</div><h2>Olá! Vamos vender beleza hoje? ✨</h2><p>Controle suas vendas, estoque e resultados em um só lugar.</p></div><div class="welcome-star">✦</div></div>
 <div class="grid stats">
 <div class="stat-card"><div class="stat-icon">R$</div><div class="stat-label">VENDAS DE HOJE</div><div class="stat-value">${money(revenue)}</div><div class="stat-foot">${todays.length} venda(s) registradas</div></div>
 <div class="stat-card"><div class="stat-icon">▤</div><div class="stat-label">VENDAS ACUMULADAS</div><div class="stat-value">${money(allRevenue)}</div><div class="stat-foot">${state.sales.length} venda(s) no sistema</div></div>
 <div class="stat-card"><div class="stat-icon">◇</div><div class="stat-label">PRODUTOS CADASTRADOS</div><div class="stat-value">${state.products.length}</div><div class="stat-foot">${lowStock().length} com estoque baixo</div></div>
 <div class="stat-card"><div class="stat-icon">♡</div><div class="stat-label">CLIENTES CADASTRADOS</div><div class="stat-value">${state.customers.length}</div><div class="stat-foot">Inclui cliente balcão</div></div>
 </div>
 <div class="grid two-col">
 <div class="panel"><div class="panel-head"><h2>Vendas recentes</h2><button class="button small" data-goto="sales">Ver todas</button></div>${recent.length?`<div class="table-wrap"><table><thead><tr><th>DATA</th><th>VENDA</th><th>PAGAMENTO</th><th>TOTAL</th></tr></thead><tbody>${recent.map(s=>`<tr><td>${dateTime(s.date)}</td><td>#${esc(s.number)}</td><td>${esc(s.payment)}</td><td><b>${money(s.total)}</b></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Suas vendas aparecerão aqui quando você registrar a primeira.</div>`}</div>
 <div class="panel"><div class="panel-head"><h2>Estoque baixo</h2><button class="button small" data-goto="products">Ver produtos</button></div>${lowStock().length?lowStock().slice(0,6).map(p=>`<div class="cart-line"><div><strong>${esc(p.name)}</strong><small>Estoque mínimo: ${p.minStock}</small></div><span class="pill ${p.stock<=0?"red":"orange"}">${p.stock} un.</span></div>`).join(""):`<div class="empty">Nenhum produto abaixo do estoque mínimo. ✨</div>`}
 <div class="settings-note" style="margin-top:14px">Lembrete: este sistema salva os dados neste navegador. Faça backups frequentes em Configurações.</div></div></div>`;
}
function renderPDV(){
 const products=state.products.filter(p=>p.name.toLowerCase().includes(productFilter.toLowerCase())||p.sku.toLowerCase().includes(productFilter.toLowerCase()));
 const subtotal=cart.reduce((a,i)=>a+i.price*i.qty,0);
 return `<div class="notice">Antes de finalizar, confira os itens e a forma de pagamento. Esta versão registra vendas localmente e não emite cupom fiscal/NFC-e.</div>
 <div class="pos-layout"><div class="panel"><div class="panel-head"><h2>Selecionar produtos</h2><span class="pill">${products.length} itens</span></div>
 <input class="searchbox" id="pdvSearch" placeholder="Buscar por nome ou código..." value="${esc(productFilter)}" autocomplete="off" style="max-width:none;margin-bottom:14px">
 <div class="product-grid">${products.map(p=>`<button class="product-tile" data-add-product="${p.id}" ${p.stock<=0?"disabled":""}><div><strong>${esc(p.name)}</strong><small>${esc(p.category)} • ${p.stock} em estoque</small></div><div class="price">${money(p.price)}</div></button>`).join("")||`<div class="empty">Nenhum produto encontrado.</div>`}</div></div>
 <div class="panel cart-panel"><div class="panel-head"><h2>Carrinho</h2><button class="button small" id="clearCart">Limpar</button></div>
 ${cart.length?cart.map(i=>`<div class="cart-line"><div><strong>${esc(i.name)}</strong><small>${money(i.price)} cada • ${money(i.price*i.qty)}</small></div><div class="qty"><button data-qty="-1" data-id="${i.id}">−</button><span>${i.qty}</span><button data-qty="1" data-id="${i.id}">+</button></div></div>`).join(""):`<div class="empty">Adicione produtos para iniciar uma venda.</div>`}
 <div class="cart-total"><div class="total-row"><span>Subtotal</span><b>${money(subtotal)}</b></div><div class="total-row"><label for="discount">Desconto (R$)</label><input id="discount" type="number" min="0" max="${subtotal}" step=".01" value="0" style="width:95px;padding:6px;border:1px solid var(--line);border-radius:7px"></div><div class="total-row big"><span>Total</span><span id="cartTotal">${money(subtotal)}</span></div>
 <div class="field"><label>Cliente</label><select id="saleCustomer">${state.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>
 <div class="field" style="margin-top:10px"><label>Forma de pagamento</label><select id="payment"><option>Pix</option><option>Dinheiro</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Outro</option></select></div>
 <div id="changeWrap" class="field" style="display:none;margin-top:10px"><label>Valor recebido</label><input id="cashReceived" type="number" min="0" step=".01" placeholder="0,00"><small id="changeLabel" class="muted"></small></div>
 <div class="cart-actions"><button class="button" id="holdSale">Guardar carrinho</button><button class="button secondary" id="restoreCart">Recuperar</button><button class="button primary wide" id="finishSale" ${cart.length?"":"disabled"}>Finalizar venda</button></div>
 </div></div></div>`;
}
function renderProducts(){
 return `<div class="section-title"><div><h2>Cadastro de produtos</h2><p>Controle preços, custos e quantidade disponível.</p></div><button class="button primary" id="newProduct">＋ Novo produto</button></div>
 <div class="toolbar"><input id="productSearch" class="searchbox" placeholder="Buscar produto ou código..." value="${esc(productFilter)}"><span class="pill">${state.products.length} produtos</span><button class="button" id="exportProducts">Exportar CSV</button></div>
 <div class="panel"><div class="table-wrap"><table><thead><tr><th>PRODUTO</th><th>CÓDIGO</th><th>CATEGORIA</th><th>CUSTO</th><th>PREÇO</th><th>ESTOQUE</th><th>AÇÕES</th></tr></thead><tbody>${state.products.filter(p=>(p.name+" "+p.sku+" "+p.category).toLowerCase().includes(productFilter.toLowerCase())).map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.sku)}</td><td>${esc(p.category)}</td><td>${money(p.cost)}</td><td><b>${money(p.price)}</b></td><td><span class="pill ${p.stock<=p.minStock?"orange":"green"}">${p.stock}</span></td><td><div class="inline-actions"><button class="button small" data-edit-product="${p.id}">Editar</button><button class="button small danger" data-delete-product="${p.id}">Excluir</button></div></td></tr>`).join("")||`<tr><td colspan="7" class="empty">Nenhum produto cadastrado.</td></tr>`}</tbody></table></div></div>`;
}
function renderCustomers(){
 return `<div class="section-title"><div><h2>Clientes</h2><p>Cadastre clientes para associar às vendas.</p></div><button class="button primary" id="newCustomer">＋ Novo cliente</button></div>
 <div class="toolbar"><input id="customerSearch" class="searchbox" placeholder="Buscar nome, telefone ou e-mail..." value="${esc(customerFilter)}"><span class="pill">${state.customers.length} clientes</span></div>
 <div class="panel"><div class="table-wrap"><table><thead><tr><th>NOME</th><th>TELEFONE</th><th>E-MAIL</th><th>OBSERVAÇÕES</th><th>AÇÕES</th></tr></thead><tbody>${state.customers.filter(c=>(c.name+" "+c.phone+" "+c.email).toLowerCase().includes(customerFilter.toLowerCase())).map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.phone||"—")}</td><td>${esc(c.email||"—")}</td><td>${esc(c.notes||"—")}</td><td><div class="inline-actions"><button class="button small" data-edit-customer="${c.id}">Editar</button>${c.id!=="c1"?`<button class="button small danger" data-delete-customer="${c.id}">Excluir</button>`:""}</div></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Nenhum cliente encontrado.</td></tr>`}</tbody></table></div></div>`;
}
function renderSales(){
 const list=[...state.sales].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(s=>(String(s.number)+" "+s.customerName+" "+s.payment).toLowerCase().includes(salesFilter.toLowerCase()));
 return `<div class="section-title"><div><h2>Histórico de vendas</h2><p>Consulte vendas registradas e imprima comprovantes simples.</p></div><button class="button primary" data-goto="pdv">＋ Nova venda</button></div>
 <div class="toolbar"><input class="searchbox" id="salesSearch" placeholder="Buscar nº da venda, cliente ou pagamento..." value="${esc(salesFilter)}"><button class="button" id="exportSales">Exportar CSV</button></div>
 <div class="panel"><div class="table-wrap"><table><thead><tr><th>DATA</th><th>Nº</th><th>CLIENTE</th><th>PAGAMENTO</th><th>ITENS</th><th>TOTAL</th><th>AÇÕES</th></tr></thead><tbody>${list.map(s=>`<tr><td>${dateTime(s.date)}</td><td>#${esc(s.number)}</td><td>${esc(s.customerName)}</td><td>${esc(s.payment)}</td><td>${s.items.reduce((a,i)=>a+i.qty,0)}</td><td><b>${money(s.total)}</b></td><td><div class="inline-actions"><button class="button small" data-receipt="${s.id}">Comprovante</button><button class="button small danger" data-cancel-sale="${s.id}">Cancelar</button></div></td></tr>`).join("")||`<tr><td colspan="7" class="empty">Nenhuma venda registrada ainda.</td></tr>`}</tbody></table></div></div>`;
}
function renderExpenses(){
 return `<div class="section-title"><div><h2>Despesas</h2><p>Registre custos da loja para acompanhar as saídas.</p></div><button class="button primary" id="newExpense">＋ Nova despesa</button></div>
 <div class="toolbar"><input class="searchbox" id="expenseSearch" placeholder="Buscar despesa..." value="${esc(expenseFilter)}"><span class="pill">${state.expenses.length} registros</span><button class="button" id="exportExpenses">Exportar CSV</button></div>
 <div class="panel"><div class="table-wrap"><table><thead><tr><th>DATA</th><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>VALOR</th><th>AÇÕES</th></tr></thead><tbody>${[...state.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(e=>(e.description+" "+e.category).toLowerCase().includes(expenseFilter.toLowerCase())).map(e=>`<tr><td>${dateOnly(e.date)}</td><td><b>${esc(e.description)}</b></td><td>${esc(e.category)}</td><td class="negative">${money(e.amount)}</td><td><button class="button small danger" data-delete-expense="${e.id}">Excluir</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Nenhuma despesa registrada.</td></tr>`}</tbody></table></div></div>`;
}
function renderReports(){
 const sales=state.sales, revenue=sales.reduce((a,s)=>a+s.total,0), cogs=sales.reduce((a,s)=>a+s.items.reduce((n,i)=>n+i.cost*i.qty,0),0), expenses=state.expenses.reduce((a,e)=>a+e.amount,0);
 const byPay={}; sales.forEach(s=>byPay[s.payment]=(byPay[s.payment]||0)+s.total);
 const best={}; sales.forEach(s=>s.items.forEach(i=>{if(!best[i.name])best[i.name]={qty:0,total:0};best[i.name].qty+=i.qty;best[i.name].total+=i.price*i.qty;}));
 const bestRows=Object.entries(best).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8);
 return `<div class="section-title"><div><h2>Relatórios</h2><p>Resumo acumulado dos registros existentes neste navegador.</p></div><button class="button" id="exportBackup">Baixar backup completo (JSON)</button></div>
 <div class="notice">O resumo é baseado nos registros salvos neste navegador. Não substitui contabilidade, conciliação bancária nem relatórios fiscais.</div>
 <div class="grid stats"><div class="stat-card"><div class="stat-label">FATURAMENTO REGISTRADO</div><div class="stat-value">${money(revenue)}</div><div class="stat-foot">${sales.length} vendas</div></div><div class="stat-card"><div class="stat-label">CUSTO DOS ITENS VENDIDOS</div><div class="stat-value">${money(cogs)}</div><div class="stat-foot">Conforme custo cadastrado</div></div><div class="stat-card"><div class="stat-label">DESPESAS REGISTRADAS</div><div class="stat-value">${money(expenses)}</div><div class="stat-foot">${state.expenses.length} despesas</div></div><div class="stat-card"><div class="stat-label">RESULTADO ESTIMADO</div><div class="stat-value">${money(revenue-cogs-expenses)}</div><div class="stat-foot">Antes de impostos e outros custos</div></div></div>
 <div class="grid two-col"><div class="panel"><h2>Vendas por forma de pagamento</h2>${Object.keys(byPay).length?`<table><thead><tr><th>FORMA</th><th>TOTAL</th></tr></thead><tbody>${Object.entries(byPay).map(([k,v])=>`<tr><td>${esc(k)}</td><td><b>${money(v)}</b></td></tr>`).join("")}</tbody></table>`:`<div class="empty">Registre vendas para gerar o relatório.</div>`}</div><div class="panel"><h2>Produtos mais vendidos</h2>${bestRows.length?`<table><thead><tr><th>PRODUTO</th><th>UNIDADES</th><th>TOTAL</th></tr></thead><tbody>${bestRows.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v.qty}</td><td>${money(v.total)}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">Ainda não há dados de vendas.</div>`}</div></div>`;
}
function renderSettings(){
 return `<div class="grid settings-grid"><div class="panel"><h2>Identidade da loja</h2><form id="settingsForm" class="form-grid"><div class="field full"><label>Nome da loja</label><input name="storeName" required value="${esc(state.settings.storeName)}"></div><div class="field full"><label>Slogan</label><input name="slogan" value="${esc(state.settings.slogan)}"></div><div class="field"><label>Preço inicial anunciado (R$)</label><input name="minPrice" type="number" min="0" step=".01" value="${state.settings.minPrice}"></div><div class="field"><label>Moeda</label><input value="Real brasileiro (BRL)" disabled></div><div class="form-actions full"><button class="button primary">Salvar configurações</button></div></form></div>
 <div class="panel"><h2>Dados e segurança</h2><p class="muted small-text">Os dados ficam salvos no armazenamento local deste navegador e deste dispositivo.</p><div class="settings-note">Não limpe os dados do navegador sem fazer backup. Para usar em outro computador, restaure o arquivo JSON de backup. Esta versão não sincroniza entre dispositivos e não possui login multiusuário.</div><div class="grid" style="margin-top:14px"><button class="button secondary" id="backupBtn">Baixar backup JSON</button><label class="button" for="restoreFile" style="text-align:center">Restaurar backup JSON</label><input id="restoreFile" type="file" accept=".json,application/json" hidden><button class="button danger" id="resetData">Restaurar dados de demonstração</button></div></div>
 <div class="panel"><h2>Caixa</h2><p class="muted small-text">Controle simples de abertura e fechamento de caixa para esta instalação.</p><div class="settings-note">${state.cash.open?`Caixa aberto desde ${dateTime(state.cash.openedAt)}. Valor inicial: ${money(state.cash.opening)}.`:"O caixa está fechado."}</div><div class="form-actions"><button class="button ${state.cash.open?"danger":"primary"}" id="toggleCash">${state.cash.open?"Fechar caixa":"Abrir caixa"}</button></div>${state.cash.history.length?`<h3 style="margin-top:20px">Últimos fechamentos</h3>${state.cash.history.slice(-4).reverse().map(c=>`<div class="cart-line"><div><strong>${dateTime(c.closedAt)}</strong><small>Esperado: ${money(c.expected)} • Contado: ${money(c.counted)}</small></div><span class="pill">${money(c.difference)}</span></div>`).join("")}`:""}</div>
 <div class="panel"><h2>Exportação de dados</h2><p class="muted small-text">Baixe arquivos para planilha ou backup.</p><div class="grid"><button class="button" id="settingsExportProducts">Exportar produtos CSV</button><button class="button" id="settingsExportSales">Exportar vendas CSV</button><button class="button" id="settingsExportExpenses">Exportar despesas CSV</button></div></div></div>`;
}
function bindPage(){
 const on=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener("click",fn)};
 const input=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener("input",fn)};
 on("newProduct",()=>productModal());on("newCustomer",()=>customerModal());on("newExpense",()=>expenseModal());
 input("productSearch",e=>{productFilter=e.target.value;const pos=e.target.selectionStart;render();const el=document.getElementById("productSearch");el.focus();el.setSelectionRange(pos,pos)});
 input("customerSearch",e=>{customerFilter=e.target.value;const pos=e.target.selectionStart;render();const el=document.getElementById("customerSearch");el.focus();el.setSelectionRange(pos,pos)});
 input("salesSearch",e=>{salesFilter=e.target.value;const pos=e.target.selectionStart;render();const el=document.getElementById("salesSearch");el.focus();el.setSelectionRange(pos,pos)});
 input("expenseSearch",e=>{expenseFilter=e.target.value;const pos=e.target.selectionStart;render();const el=document.getElementById("expenseSearch");el.focus();el.setSelectionRange(pos,pos)});
 input("pdvSearch",e=>{productFilter=e.target.value;const pos=e.target.selectionStart;render();const el=document.getElementById("pdvSearch");el.focus();el.setSelectionRange(pos,pos)});
 document.querySelectorAll("[data-add-product]").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.addProduct)));
 document.querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.id,Number(b.dataset.qty))));
 on("clearCart",()=>{cart=[];render()});
 on("holdSale",()=>{localStorage.setItem(KEY+"_held_cart",JSON.stringify(cart));toast("Carrinho guardado neste navegador.")});
 on("restoreCart",()=>{try{cart=JSON.parse(localStorage.getItem(KEY+"_held_cart")||"[]");render();toast("Carrinho recuperado.")}catch(e){toast("Não foi possível recuperar o carrinho.")}});
 on("finishSale",finishSale);
 const pay=document.getElementById("payment");if(pay)pay.addEventListener("change",()=>{document.getElementById("changeWrap").style.display=pay.value==="Dinheiro"?"flex":"none"});
 const received=document.getElementById("cashReceived");if(received)received.addEventListener("input",updateChange);
 input("discount",updateCartTotal);
 document.querySelectorAll("[data-edit-product]").forEach(b=>b.addEventListener("click",()=>productModal(b.dataset.editProduct)));
 document.querySelectorAll("[data-delete-product]").forEach(b=>b.addEventListener("click",()=>deleteProduct(b.dataset.deleteProduct)));
 document.querySelectorAll("[data-edit-customer]").forEach(b=>b.addEventListener("click",()=>customerModal(b.dataset.editCustomer)));
 document.querySelectorAll("[data-delete-customer]").forEach(b=>b.addEventListener("click",()=>deleteCustomer(b.dataset.deleteCustomer)));
 document.querySelectorAll("[data-delete-expense]").forEach(b=>b.addEventListener("click",()=>deleteExpense(b.dataset.deleteExpense)));
 document.querySelectorAll("[data-cancel-sale]").forEach(b=>b.addEventListener("click",()=>cancelSale(b.dataset.cancelSale)));
 document.querySelectorAll("[data-receipt]").forEach(b=>b.addEventListener("click",()=>receipt(b.dataset.receipt)));
 on("exportProducts",exportProducts);on("settingsExportProducts",exportProducts);
 on("exportSales",exportSales);on("settingsExportSales",exportSales);
 on("exportExpenses",exportExpenses);on("settingsExportExpenses",exportExpenses);
 on("exportBackup",downloadBackup);on("backupBtn",downloadBackup);
 on("resetData",resetData);
 const sf=document.getElementById("settingsForm");if(sf)sf.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(sf);state.settings.storeName=f.get("storeName").trim();state.settings.slogan=f.get("slogan").trim();state.settings.minPrice=Number(f.get("minPrice"))||0;saveState();toast("Configurações salvas.");render()});
 const rf=document.getElementById("restoreFile");if(rf)rf.addEventListener("change",restoreBackup);
 on("toggleCash",toggleCash);
}
function addToCart(id){const p=state.products.find(p=>p.id===id);if(!p||p.stock<=0){toast("Produto sem estoque disponível.");return}const existing=cart.find(i=>i.id===id);if(existing){if(existing.qty>=p.stock){toast("Quantidade maior que o estoque.");return}existing.qty++}else cart.push({id:p.id,name:p.name,price:Number(p.price),cost:Number(p.cost),qty:1});render();}
function changeQty(id,d){const i=cart.find(i=>i.id===id);if(!i)return;const p=state.products.find(p=>p.id===id);i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);else if(p&&i.qty>p.stock){i.qty=p.stock;toast("Quantidade limitada ao estoque disponível.")}render();}
function getDiscount(){const subtotal=cart.reduce((a,i)=>a+i.price*i.qty,0);return Math.min(Math.max(0,Number(document.getElementById("discount")?.value)||0),subtotal);}
function updateCartTotal(){const subtotal=cart.reduce((a,i)=>a+i.price*i.qty,0),disc=getDiscount(),total=Math.max(0,subtotal-disc);const el=document.getElementById("cartTotal");if(el)el.textContent=money(total);const d=document.getElementById("discount");if(d)d.max=subtotal;updateChange();}
function updateChange(){const total=Math.max(0,cart.reduce((a,i)=>a+i.price*i.qty,0)-getDiscount());const received=Number(document.getElementById("cashReceived")?.value)||0;const label=document.getElementById("changeLabel");if(label)label.textContent="Troco: "+money(Math.max(0,received-total));}
function finishSale(){
 if(!cart.length){toast("Adicione pelo menos um produto.");return}
 const discount=getDiscount(),subtotal=cart.reduce((a,i)=>a+i.price*i.qty,0),total=Math.max(0,subtotal-discount),payment=document.getElementById("payment").value;
 for(const i of cart){const p=state.products.find(p=>p.id===i.id);if(!p||p.stock<i.qty){toast("Estoque insuficiente para "+i.name);return}}
 if(payment==="Dinheiro"&&Number(document.getElementById("cashReceived")?.value||0)<total){toast("O valor recebido é menor que o total.");return}
 const customer=state.customers.find(c=>c.id===document.getElementById("saleCustomer").value)||state.customers[0];
 const sale={id:uid("sale"),number:Date.now().toString().slice(-7),date:new Date().toISOString(),customerId:customer?.id||"",customerName:customer?.name||"Cliente balcão",payment,subtotal,discount,total,items:cart.map(i=>({...i})),status:"Concluída"};
 sale.items.forEach(i=>{const p=state.products.find(p=>p.id===i.id);p.stock-=i.qty});
 state.sales.push(sale);saveState();cart=[];localStorage.removeItem(KEY+"_held_cart");render();toast("Venda finalizada com sucesso!");setTimeout(()=>receipt(sale.id),250);
}
function productModal(id){
 const p=id?state.products.find(p=>p.id===id):null;
 showModal(`${p?"Editar":"Novo"} produto`,`<form id="productForm" class="form-grid">
 <div class="field full"><label>Nome do produto *</label><input name="name" required value="${esc(p?.name||"")}"></div>
 <div class="field"><label>Código/SKU</label><input name="sku" value="${esc(p?.sku||"")}"></div>
 <div class="field"><label>Categoria</label><select name="category">${["Lábios","Olhos","Rosto","Acessórios","Skincare","Outros"].map(c=>`<option ${p?.category===c?"selected":""}>${c}</option>`).join("")}</select></div>
 <div class="field"><label>Custo unitário (R$) *</label><input name="cost" type="number" min="0" step=".01" required value="${p?.cost??""}"></div>
 <div class="field"><label>Preço de venda (R$) *</label><input name="price" type="number" min="0" step=".01" required value="${p?.price??""}"></div>
 <div class="field"><label>Estoque atual *</label><input name="stock" type="number" min="0" step="1" required value="${p?.stock??0}"></div>
 <div class="field"><label>Estoque mínimo</label><input name="minStock" type="number" min="0" step="1" value="${p?.minStock??2}"></div>
 <div class="form-actions full"><button type="button" class="button" data-close-modal>Cancelar</button><button class="button primary">Salvar produto</button></div></form>`);
 document.getElementById("productForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target),obj={id:p?.id||uid("p"),name:f.get("name").trim(),sku:f.get("sku").trim()||"SKU-"+Date.now().toString().slice(-6),category:f.get("category"),cost:Number(f.get("cost")),price:Number(f.get("price")),stock:Number(f.get("stock")),minStock:Number(f.get("minStock"))};if(obj.price<obj.cost){if(!confirm("O preço de venda é menor que o custo. Deseja salvar mesmo assim?"))return}if(p)state.products=state.products.map(x=>x.id===p.id?obj:x);else state.products.push(obj);saveState();closeModal();render();toast("Produto salvo.");});
}
function customerModal(id){
 const c=id?state.customers.find(c=>c.id===id):null;
 showModal(`${c?"Editar":"Novo"} cliente`,`<form id="customerForm" class="form-grid"><div class="field full"><label>Nome *</label><input name="name" required value="${esc(c?.name||"")}"></div><div class="field"><label>Telefone/WhatsApp</label><input name="phone" value="${esc(c?.phone||"")}"></div><div class="field"><label>E-mail</label><input name="email" type="email" value="${esc(c?.email||"")}"></div><div class="field full"><label>Observações</label><textarea name="notes" rows="3">${esc(c?.notes||"")}</textarea></div><div class="form-actions full"><button type="button" class="button" data-close-modal>Cancelar</button><button class="button primary">Salvar cliente</button></div></form>`);
 document.getElementById("customerForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target),obj={id:c?.id||uid("c"),name:f.get("name").trim(),phone:f.get("phone").trim(),email:f.get("email").trim(),notes:f.get("notes").trim()};if(c)state.customers=state.customers.map(x=>x.id===c.id?obj:x);else state.customers.push(obj);saveState();closeModal();render();toast("Cliente salvo.");});
}
function expenseModal(){
 showModal("Nova despesa",`<form id="expenseForm" class="form-grid"><div class="field full"><label>Descrição *</label><input name="description" required placeholder="Ex.: compra de sacolas"></div><div class="field"><label>Categoria</label><select name="category"><option>Estoque</option><option>Embalagens</option><option>Energia/água</option><option>Transporte</option><option>Marketing</option><option>Equipamentos</option><option>Outros</option></select></div><div class="field"><label>Valor (R$) *</label><input name="amount" type="number" min=".01" step=".01" required></div><div class="field full"><label>Data</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-actions full"><button type="button" class="button" data-close-modal>Cancelar</button><button class="button primary">Salvar despesa</button></div></form>`);
 document.getElementById("expenseForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target),amount=Number(f.get("amount"));if(amount<=0)return;state.expenses.push({id:uid("e"),description:f.get("description").trim(),category:f.get("category"),amount,date:new Date(f.get("date")+"T12:00:00").toISOString()});saveState();closeModal();render();toast("Despesa registrada.");});
}
function deleteProduct(id){const p=state.products.find(p=>p.id===id);if(!p)return;if(!confirm(`Excluir o produto "${p.name}"? O histórico de vendas será mantido.`))return;state.products=state.products.filter(p=>p.id!==id);cart=cart.filter(i=>i.id!==id);saveState();render();toast("Produto excluído.");}
function deleteCustomer(id){const c=state.customers.find(c=>c.id===id);if(!c)return;if(!confirm(`Excluir o cliente "${c.name}"?`))return;state.customers=state.customers.filter(c=>c.id!==id);saveState();render();toast("Cliente excluído.");}
function deleteExpense(id){const e=state.expenses.find(e=>e.id===id);if(!e||!confirm(`Excluir a despesa "${e.description}"?`))return;state.expenses=state.expenses.filter(x=>x.id!==id);saveState();render();toast("Despesa excluída.");}
function cancelSale(id){const s=state.sales.find(s=>s.id===id);if(!s)return;if(!confirm(`Cancelar a venda #${s.number}? Os itens retornarão ao estoque. Esta ação não pode ser desfeita.`))return;s.items.forEach(i=>{const p=state.products.find(p=>p.id===i.id);if(p)p.stock+=i.qty});s.status="Cancelada";s.cancelledAt=new Date().toISOString();s.total=0;saveState();render();toast("Venda cancelada e estoque ajustado.");}
function receipt(id){const s=state.sales.find(s=>s.id===id);if(!s)return;const lines=[state.settings.storeName,state.settings.slogan,"--------------------------------",`Venda: #${s.number}`,`Data: ${dateTime(s.date)}`,`Cliente: ${s.customerName}`,`Pagamento: ${s.payment}`,"--------------------------------",...s.items.map(i=>`${i.qty}x ${i.name} @ ${money(i.price)} = ${money(i.qty*i.price)}`),"--------------------------------",`Subtotal: ${money(s.subtotal)}`,`Desconto: ${money(s.discount)}`,`TOTAL: ${money(s.total)}`,"","Comprovante não fiscal."];const w=window.open("","_blank","width=420,height=650");if(!w){toast("Permita pop-ups para imprimir o comprovante.");return}w.document.write(`<html><head><title>Comprovante</title><style>body{font-family:monospace;padding:24px;max-width:360px;margin:auto}pre{white-space:pre-wrap;font-size:13px}button{padding:8px 15px}</style></head><body><pre>${esc(lines.join("\n"))}</pre><button onclick="window.print()">Imprimir</button></body></html>`);w.document.close();}
function showModal(title,content){document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal"><div class="panel-head"><h2>${title}</h2><button class="button small" data-close-modal>✕</button></div>${content}</div></div>`;document.querySelectorAll("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});}
function closeModal(){document.getElementById("modalRoot").innerHTML="";}
function csvDownload(filename,rows){const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});downloadBlob(filename,blob);}
function downloadBlob(filename,blob){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}
function exportProducts(){csvDownload("edvi-produtos.csv",[["Nome","Código","Categoria","Custo","Preço","Estoque","Estoque mínimo"],...state.products.map(p=>[p.name,p.sku,p.category,p.cost,p.price,p.stock,p.minStock])]);}
function exportSales(){csvDownload("edvi-vendas.csv",[["Data","Número","Cliente","Pagamento","Subtotal","Desconto","Total","Status"],...state.sales.map(s=>[dateTime(s.date),s.number,s.customerName,s.payment,s.subtotal,s.discount,s.total,s.status])]);}
function exportExpenses(){csvDownload("edvi-despesas.csv",[["Data","Descrição","Categoria","Valor"],...state.expenses.map(e=>[dateOnly(e.date),e.description,e.category,e.amount])]);}
function downloadBackup(){downloadBlob("edvi-aurora-backup-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));toast("Backup gerado.");}
function restoreBackup(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.products||!data.sales||!data.customers)throw new Error("Arquivo inválido");if(!confirm("Restaurar este backup substituirá os dados atuais. Continuar?"))return;state={...structuredClone(defaultState),...data,settings:{...defaultState.settings,...data.settings},cash:{...defaultState.cash,...data.cash}};saveState();render();toast("Backup restaurado.");}catch(err){alert("Não foi possível restaurar: arquivo inválido ou incompatível.")}};reader.readAsText(file);e.target.value="";}
function resetData(){if(!confirm("Isso substituirá os dados atuais pelos dados de demonstração. Faça backup antes. Continuar?"))return;state=structuredClone(defaultState);cart=[];saveState();render();toast("Dados de demonstração restaurados.");}
function toggleCash(){
 if(!state.cash.open){const raw=prompt("Informe o valor inicial em dinheiro no caixa (R$):","0");if(raw===null)return;const opening=Number(raw.replace(",","."));if(!Number.isFinite(opening)||opening<0){toast("Valor inválido.");return}state.cash.open=true;state.cash.opening=opening;state.cash.openedAt=new Date().toISOString();saveState();render();toast("Caixa aberto.");}
 else{const cashSales=state.sales.filter(s=>s.status!=="Cancelada"&&new Date(s.date)>=new Date(state.cash.openedAt)&&s.payment==="Dinheiro").reduce((a,s)=>a+s.total,0);const expected=state.cash.opening+cashSales;const raw=prompt(`Valor esperado em dinheiro: ${money(expected)}\nInforme o valor contado (R$):`,String(expected.toFixed(2)));if(raw===null)return;const counted=Number(raw.replace(",","."));if(!Number.isFinite(counted)||counted<0){toast("Valor inválido.");return}state.cash.history.push({openedAt:state.cash.openedAt,closedAt:new Date().toISOString(),opening:state.cash.opening,expected,counted,difference:counted-expected});state.cash.open=false;state.cash.opening=0;state.cash.openedAt=null;saveState();render();toast("Caixa fechado.");}
}
render();
