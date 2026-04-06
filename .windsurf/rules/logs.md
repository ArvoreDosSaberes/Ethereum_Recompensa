---
trigger: always_on
---
A pasta logs deve sempre estar na raiz do projeto.

Em todo o código deve haver logs, eles devem ter suas linhas identificadas com emoticons conforme o contexto.

Em caso de firmware, codigo para MCUs, não use emoticons, adicione sempre a possibilidade de remover o código do log através de parametros no cmake, algo como versão debug e versão produção, no caso do esp32 use os artefatos que o esp-idf oferece.

Cada linha deve ter data, nome do arquivo, nome da função, linha, mensagem do que se trata, parametros relevantes e que não sejam sensíveis

os Logs devem ser armazenados na pasta "logs"
