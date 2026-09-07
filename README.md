# Landing Page — Regnier Instrutor

Landing page demonstrativa com foco em conversão para WhatsApp, identidade creme/marinho/amarelo e conteúdo SEO local para Serra/ES.

## 1) COLOQUE A FOTO DO REGNIER

Crie o arquivo:

`assets/regnier.jpg`

Ideal: foto vertical, boa luz, Regnier em primeiro plano, de preferência próximo a carro/moto ou em contexto de aula. O site possui um placeholder automático enquanto a foto não existir.

## 2) WHATSAPP

Abra `script.js` e altere:

```js
whatsapp: "5527999729224"
```

Use 55 + DDD + telefone, sem espaços, parênteses ou traços.

O número configurado é (27) 99972-9224. Todos os botões de WhatsApp usam essa configuração.

## 3) ALTERAR PREÇOS E QUANTIDADES

Todos os planos estão no início de `script.js`, dentro de `PLANS`. O Diamante Plus é o primeiro. O seletor inicia em `automatico` a cada abertura da página.

Exemplo:

```js
{
  id: "ouro",
  name: "Ouro",
  options: {
    automatico: { price: 1200, car: 5, moto: 5 },
    manual: { price: 500, car: 5, moto: 0 }
  }
}
```

Ao editar esses números, o site recalcula automaticamente:
- total de aulas;
- custo médio por aula, exibido somente para o Diamante Plus;
- comparação Ouro x Diamante Plus;
- mensagem do WhatsApp;
- recomendação do quiz.

Os planos manuais têm 2, 5, 10 e 15 aulas de carro, respectivamente por R$ 350, R$ 500, R$ 900 e R$ 1.300. A troca de câmbio atualiza os cards, a comparação, o quiz e as mensagens do WhatsApp.

Nos automáticos, foram preservados os preços e a composição do site anterior: Prata 2 carro + 2 moto; Ouro 5 + 5; Diamante 5 + 5 (10 no total); Plus 15 + 15. Para alterar a composição, edite `car` e `moto` dentro de `options.automatico`.

## 4) DOMÍNIO / SEO

O domínio `https://regnierinstrutor.com.br/` está configurado no `index.html` em:
- canonical;
- JSON-LD;
- Open Graph.

O mesmo domínio está configurado em `robots.txt` e `sitemap.xml`.

## 5) FOTO DE COMPARTILHAMENTO

A prévia de compartilhamento usa `https://regnierinstrutor.com.br/assets/regnier.jpg`. Para usar uma imagem específica, atualize `og:image` no `index.html` com a URL absoluta do novo arquivo.

## 6) FONTES OFICIAIS USADAS PARA O CONTEÚDO 2026

- DETRAN|ES — Primeira habilitação: https://detran.es.gov.br/primeira-habilitacao-permissao
- DETRAN|ES — Portal de instrutores autônomos: https://conteudo.detran.es.gov.br/CIA/
- Ministério dos Transportes — CNH do Brasil: https://www.gov.br/transportes/pt-br/cnh-do-brasil/

As regras podem mudar. Revise o conteúdo regulatório antes de publicar e mantenha o aviso de consulta aos canais oficiais.

## 7) ABRIR O SITE

Abra `index.html` no navegador, ou no VS Code use a extensão Live Server.

## 8) AVALIAÇÕES DOS ALUNOS

Salve as 14 fotos na pasta `assets` como `foto1.jpg`, `foto2.jpg`, até `foto14.jpg`.
O espaço da foto mostra uma numeração enquanto o arquivo não existir.

No `index.html`, procure `id="avaliacoes"`. Em cada `article` com a classe `review-card`, substitua:

- `[Insira aqui a avaliação do aluno 1.]` pelo comentário do aluno;
- `[Nome do aluno 1]` pelo nome correspondente;
- `[Categoria do aluno]` pela categoria;
- o atributo `alt` da imagem pela descrição da foto.

Repita nos 14 cards. Eles estão distribuídos em cinco grupos `.reviews-page`: quatro grupos de três e o último com dois. Para acrescentar outros, mantenha até três cards por grupo. O contador lê a quantidade de cards automaticamente.

No computador, cada grupo mostra três cards lado a lado, com fotos 4:3. No celular, os três cards ficam empilhados e as fotos aparecem na lateral. Use gesto horizontal, barra de rolagem, botões ou as teclas de seta, Home e End com o carrossel em foco. Não há avanço automático.

## 9) CATEGORIAS, TAXAS E ETAPAS

As seções `#categorias` e `#etapas` são HTML editável, sem depender das imagens de referência.

As taxas foram consultadas em 07/09/2026 na tabela do DETRAN|ES:
https://renach2.es.gov.br/Habilitacao/Publico/hab_valor_servico.aspx

- Primeira habilitação A ou B: R$ 533,34.
- Primeira habilitação AB: R$ 666,67.
- Renovação: R$ 276,54.
- CNH definitiva: R$ 222,22.

Os dois últimos valores atualizam os números da imagem enviada. O título identifica taxas de serviço, sem apresentá-las como custo total da habilitação.

O curso teórico pode ocorrer antes ou depois da abertura do processo, conforme:
https://detran.es.gov.br/Contents/Item/Display/17973
