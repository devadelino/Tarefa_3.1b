Link github: https://github.com/devadelino/Tarefa_3.1b 

# Tarefa_3.1b — Extensão do Back-office Animalec

## Objetivo

Este projeto é uma prova de conceito para a alínea b) da Tarefa 3.1. Parte da estrutura do Back-office Animalec apresentada no capítulo A.3 do livro e acrescenta duas novas entidades:

- **Sponsors:** pessoas ou organizações que patrocinam um ou vários animais.
- **Experts:** especialistas científicos associados a espécies ou famílias de animais.

A página inicial apresenta as quatro entidades originais (Utilizadores, Animais, Quizzes e Questões) como referência para mostrar onde as novas funcionalidades ficam integradas. A gestão funcional implementada nesta prova de conceito incide apenas sobre Sponsors e Experts.


## Funcionalidades implementadas

Para as duas entidades:

- Listagem de registos;
- Pesquisa;
- Adição;
- Edição;
- Visualização de detalhes;
- Remoção com confirmação;
- Navegação de regresso ao menu principal;
- Adaptação da interface a ecrãs mais pequenos.

### Sponsors

- Nome;
- Email;
- Website;
- Endereço do logótipo;
- Descrição;
- Um ou vários animais associados.

### Experts

- Nome;
- Email;
- Instituição;
- Especialidade científica;
- Espécie ou família;
- Endereço da fotografia;
- Biografia;
- Animais relacionados (associação opcional e múltipla).

Os campos e associações são uma proposta para as duas novas entidades. Os registos e animais pré-carregados são fictícios e servem apenas para testar a interface.

## Tecnologias

- HTML5 para a estrutura das páginas;
- CSS3 para a apresentação e responsividade;
- JavaScript para a interação, validação e operações sobre os registos;
- `localStorage` para guardar os dados localmente no navegador.
