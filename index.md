## Verificador de Números Primos

Algumas funções para testar se um número é primo ou gerar uma lista de números primos.

Criado com o intuito de praticar a linguagem Javascript. :nerd_face:


### Descrição
-------

O algoritmo usado para implementar a função de teste de número primo faz uso do
[*Crivo de Erastóstenes*](https://pt.wikipedia.org/wiki/Crivo_de_Erat%C3%B3stenes), no qual para descobrir se um número **N** é primo
devemos testar se ele é **divisível por algum número primo menor que N**.

No entanto, implementei uma variação mais eficiente, na qual somente é
necessário testar a divisibilidade  de N com os números primos menores ou
iguais a **raiz quadrada de N**.

Outro característica desse algoritmo que impacta diretamenta
na eficiência é que: ao descobrir um número primo na lista de números
menores ou iguais a raiz quadrada de N, excluímos da lista todos os
múltiplos desse número primo, reduzindo consideravelmente a lista a cada
número primo.


### Eficiência e limitações
----------

Dada a característica recursiva desse algoritmo, apesar da eficiência
proporcional a *Nlog(logN)*, o uso de memória se torna excessivo para
números com mais de **16 dígitos**.

Em um notebook com
processador Dual Core 3GHz, levou 2 minutos e 30 segundos para
gerar uma lista de números primos de 2 até 1 milhão, usando a função [*generatePrimes(from, to)*](#user-content-generate-primes) que itera chamadas à função de teste [*isPrimeNumber(number)*](#user-content-is-prime-number).


### Como usar
-----------

Abrir o arquivo *index.html* no navegador e usar o console do browser para chamar as funções.

Ou então, importar o arquivo javascript *primeNumbers.js* e rodar as funções da forma como você preferir.

**To-do:** Interface Web para rodar as funções de forma mais user friendly.


### Documentação
----------

- <h6 id="is-prime-number"><i>isPrimeNumber(number)</i>:</h6>

  Recebe um número inteiro positivo e retorna *true* se for primo ou *false* se for composto.

    - O parâmetro *number* deve ser validado antes da chamada da função, para garantir que a função não receberá um parâmetro inválido. (Por ser uma função recursiva optei por fazer o tratamento antes da chamada da função.)

  ```Javascript
  isPrimeNumber(13);
  >> true

  isPrimeNumber(10);
  >> false
  ```

- ###### *multipleOf(num1, num2):*
  Verifica se um número é múltiplo do outro. A ordem dos parâmetros não importa.

  ```Javascript
  multipleOf(2,4);
  >> true

  multipleOf(10,3);
  >> false
  ```

- <h6 id="generate-primes"><i>generatePrimes(from, to, listType="string")</i></h6>

  Gera uma lista de números primos maiores ou iguais a **from** e menores ou iguais a **to**.
  - Por default, retorna a lista no formato *string*. Caso qualquer outro valor seja passado em *listType*, a lista retornada será um *Array*.

  ```Javascript
  generatePrimes(0,100);
  >> "2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97"

  generatePrimes(0,20,[]);
  >> [ 2, 3, 5, 7, 11, 13, 17, 19 ]
  ```

- ###### *verificaNumeroPrimo(num):*
  Um wrapper para a função *isPrimeNumber()*, com mensagem user friendly (em português) e fazendo validação do parâmetro *num* antes de chamar a função [*isPrimeNumber()*](#user-content-is-prime-number).

  ```Javascript
  verificaNumeroPrimo(1199);
  >> "O número 1199 não é primo."

  verificaNumeroPrimo(2347);
  >> "O número 2347 é primo."

  verificaNumeroPrimo("uma string");
  >> "Entrada inválida. Apenas números inteiros positivos serão computados."
  ```

- ###### *validate(num):*
  Função auxiliar que testa se *num* é realmente um **número inteiro** e **positivo**.
  - Retorna um objeto em que o índice *0* é **true** ou **false** e o índice *\"message\"* contém a **mensagem de erro**, quando houver.

  ```Javascript
  validate(13);
  >> { 0: true, message: "" }

  validate("qualquer outra coisa");
  >> { 0: false, message: "Entrada inválida.\nApenas números inteiros positivos serão computados." }
  ```
