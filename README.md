# Dashboard Social do Brasil

Este projeto é um dashboard interativo focado na visualização de dados sociais do Brasil, explorando indicadores de criminalidade, qualidade de vida e outros fatores sociais relevantes. O objetivo é consolidar informações de diversas fontes públicas governamentais em uma interface acessível.

## Visão Geral

O dashboard utiliza APIs públicas e dados abertos para buscar e apresentar informações através de gráficos e tabelas. As principais fontes de dados incluem (mas não se limitam a):

* **BrasilAPI:** Para dados de segurança pública (originários do SINESP).
* **IPEAData:** Para uma variedade de indicadores socioeconômicos, de saúde, educação e renda.
* **IBGE (SIDRA):** Para dados demográficos, de emprego e outros indicadores sociais específicos.
* **Atlas do Desenvolvimento Humano no Brasil:** Para dados como o IDHM.

## Como Executar Localmente

Para visualizar e interagir com o dashboard localmente, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/joao00001/Dashboard-Social-do-Brasil.git
    ```
2.  **Execute com um servidor web local:**
    Devido às políticas de segurança dos navegadores (CORS), abrir o arquivo `dashboard.html` diretamente do sistema de arquivos (`file:///...`) **não permitirá** que as chamadas às APIs externas funcionem. Você precisa servi-lo através de um servidor local.
    * **Usando Python 3:**
        ```bash
        python -m http.server
        ```
        Acesse `http://localhost:8000` no seu navegador.
    * **Usando a extensão "Live Server" no VS Code:**
        Clique com o botão direito no arquivo `dashboard.html` e selecione "Open with Live Server".

## Escalabilidade

A arquitetura atual é baseada em JavaScript client-side, o que é ótimo para prototipagem e dashboards de escopo moderado. Para maior escalabilidade e robustez, futuras evoluções poderiam incluir:

* **Backend Dedicado:** Um backend (ex: Node.js, Python/Flask, etc.) poderia:
    * Servir como um proxy para as APIs externas, centralizando a lógica de busca.
    * Implementar caching para reduzir a carga nas APIs de origem e melhorar o tempo de resposta.
    * Agregar e pré-processar dados.
    * Gerenciar chaves de API de forma segura, se necessário para futuras fontes.
* **Banco de Dados:** Para armazenar dados históricos, resultados de agregações ou dados de fontes que não oferecem APIs flexíveis (ex: dados de relatórios anuais).
* **Modularização do Frontend:** Para projetos maiores, dividir o JavaScript em módulos (ES6 Modules) ou adotar um framework (React, Vue, Angular) pode melhorar a organização e manutenção.

## Contribuições da Comunidade

Colaborações são muito bem-vindas! Se você tem interesse em contribuir, algumas áreas de foco poderiam ser:

* **Adição de Novos Indicadores:** Integrar novas fontes de dados sociais relevantes.
* **Melhoria das Visualizações:** Aprimorar os gráficos e tabelas existentes ou sugerir novos.
* **Correção de Bugs:** Ajudar a identificar e corrigir problemas.
* **Refatoração de Código:** Melhorar a performance, legibilidade e manutenibilidade.
* **Interface e Experiência do Usuário (UI/UX):** Sugestões para tornar o dashboard mais intuitivo e agradável.

Sinta-se à vontade para abrir *Issues* para discutir ideias ou reportar problemas, e *Pull Requests* com suas contribuições.

## Possíveis Erros e Falhas de API

Ao lidar com múltiplas APIs externas, especialmente governamentais, é importante estar ciente de alguns desafios potenciais:

* **Instabilidade da API:** As APIs podem ficar temporariamente indisponíveis, lentas ou passar por manutenções não programadas.
* **Mudanças na API:** Endpoints, formatos de resposta ou esquemas de autenticação podem mudar, quebrando a integração.
* **Limites de Taxa (Rate Limiting):** Algumas APIs podem impor limites no número de requisições permitidas em um certo período.
* **Dados Não Encontrados (Erros 404):** Mesmo com uma requisição bem formada, a API pode não ter dados para a consulta específica (ex: para um ano ou localidade particular). O dashboard tenta tratar esses casos exibindo mensagens como "Dado indisponível".
* **Formato de Dados Inesperado:** Ocasionalmente, uma API pode retornar dados em um formato ligeiramente diferente do esperado, o que pode exigir ajustes no código de processamento.
* **CORS:** Reafirmando, tentar rodar o `dashboard.html` diretamente do sistema de arquivos bloqueará as chamadas de API. É **essencial** usar um servidor local.

O código tenta lidar com alguns desses cenários de forma elegante, exibindo mensagens informativas ao usuário, mas a natureza dinâmica das APIs externas significa que problemas podem surgir. Manter as chamadas de API e o processamento de dados robustos é um esforço contínuo.

---

Sinta-se à vontade para adaptar este README conforme a evolução do seu projeto!
