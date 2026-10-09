[README.md](https://github.com/user-attachments/files/33259700/README.md)
# EdVi Aurora Makeup — PDV para navegador

Sistema inicial de ponto de venda para uma pequena loja de maquiagem. Foi feito com HTML, CSS e JavaScript puro, sem etapa de instalação ou compilação.

## Como abrir
1. Extraia o ZIP para uma pasta do computador.
2. Abra a pasta `EdVi_Aurora_Makeup_PDV` no Visual Studio Code.
3. Abra o arquivo `index.html` no navegador. Você também pode instalar a extensão **Live Server** no VS Code e clicar em **Go Live** para abrir o projeto.
4. Os dados de demonstração podem ser alterados ou removidos na seção Configurações.

## Funcionalidades incluídas
- Painel com resumo de vendas e alertas de estoque baixo.
- Frente de caixa com pesquisa de produtos, carrinho, desconto, seleção de cliente e forma de pagamento.
- Validação de estoque e baixa automática na finalização da venda.
- Comprovante simples para imprimir (não fiscal).
- Cadastro, edição, pesquisa e exclusão de produtos.
- Cadastro e edição de clientes.
- Histórico de vendas, cancelamento com retorno dos itens ao estoque.
- Registro e exclusão de despesas.
- Relatórios acumulados, produtos mais vendidos e vendas por forma de pagamento.
- Abertura e fechamento simples de caixa.
- Exportação CSV de produtos, vendas e despesas.
- Backup e restauração JSON.
- Dados salvos em `localStorage` do navegador.

## Importante: limitações desta versão
- É uma versão inicial local, para um único navegador/perfil. Não há sincronização entre dispositivos, servidor, login, permissões multiusuário nem banco de dados central.
- Os dados podem ser perdidos se o armazenamento do navegador for apagado. Baixe backups com frequência.
- O comprovante impresso é **não fiscal**. O sistema não emite NFC-e/NF-e, não se conecta à SEFAZ, não valida certificado digital e não substitui obrigações fiscais.
- Relatórios são gerenciais e não substituem contabilidade ou conciliação.
- Antes de usar comercialmente, teste com dados fictícios e confirme as exigências legais e fiscais aplicáveis.
- Para uma versão multiusuário/produção, o próximo passo é adicionar backend/API, banco de dados com backups, autenticação e integração fiscal adequada.

## Atalhos
- `F4`: abrir a frente de caixa.
- `Esc`: fechar janelas modais.

## Estrutura
- `index.html`: estrutura da aplicação.
- `css/styles.css`: estilo responsivo pink/lilás.
- `js/app.js`: dados e regras do PDV.
