import {
  cachedPrimes,
  primeNumbersListBetween,
  firstNPrimes,
  InvalidArgumentError,
  isValidNumber,
} from '../primeNumbers.js';

const asyncTimeout = miliseconds => {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds);
  });
};

const LIMIT = 1_000_000;

class Message {
  static display(type, message, messageArea) {
    messageArea.text(`${message}`).hide();

    let isListResult = false;
    if (messageArea.hasClass('listResult')) {
      messageArea.removeClass('listResult');
      isListResult = true;
    }

    messageArea.addClass('msg');
    messageArea.addClass(type);

    const sectionID = messageArea.parent().attr('id');
    togglePeriod(sectionID, ':');
    toggleIcons(sectionID, 'hide');

    messageArea.slideDown('slow', async () => {
      await asyncTimeout(2000);
      messageArea.slideUp('slow', () => {
        togglePeriod(sectionID, '.');
        messageArea.empty();
      });
      await asyncTimeout(2000);

      messageArea.removeClass(type);
      messageArea.removeClass('msg');
      isListResult ? messageArea.addClass('listResult') : null;
    });
  }
}

function validateInput(value, message = 'Digite um número inteiro positivo.') {
  let parsedValue = parseInt(value);

  if (value.match(/\D+/)) {
    throw new InvalidArgumentError(message);
  }

  try {
    isValidNumber(parsedValue);
  } catch (error) {
    if (/([Nn]umber).+(too).+(large)/.test(error.message)) {
      const limit = +error.message.match(/\d+/);
      message = `Número muito grande. 
        Digite um número menor ou igual a ${limit.toLocaleString('pt-BR')}`;
    }
    throw new InvalidArgumentError(message);
  }

  return parsedValue;
}

const togglePeriod = (sectionID, char) => {
  const element = $(`span[id*="${sectionID}"]`);
  const punctuationMark = element.text();
  if (punctuationMark !== char) {
    element.text(char);
  }
};

const toggleIcons = (sectionID, action) => {
  const icons = $(`#${sectionID} .icons-wrapper`);
  const isVisible = icons.is(':visible');

  if (action === 'show' && !isVisible) {
    icons.fadeIn();
  } else if (action === 'hide' && isVisible) {
    icons.fadeOut();
  }

  $(`#${sectionID} .icon[type="toggle"]`).removeClass('expand collapse');
};

function renderConfirmationArea(params, fn) {
  const sectionID = params.sectionID;

  $(`#${sectionID} .js-result`).text('').slideUp('slow');
  $(`#${sectionID} input`).prop('disabled', true);
  toggleIcons(sectionID, 'hide');

  let confirmBtn = $('<button>')
    .attr({
      id: `${sectionID}-confirm-btn`,
      class: 'button',
      type: 'confirm',
      text: 'Confirmar',
    })
    .html('Confirmar')
    .on('click', event => handleBtnClick(event, params, fn));

  let cancelBtn = $('<button>')
    .attr({
      id: `${sectionID}-cancel-btn`,
      class: 'button',
      type: 'cancel',
      text: 'Cancelar',
    })
    .html('Cancelar')
    .on('click', event => handleBtnClick(event, params, fn));

  let span = $('<span>').addClass('btn-wrapper');
  span.append(confirmBtn).append(cancelBtn);

  let div = $('<div>')
    .attr({
      class: 'largeNumbersMsg msg error',
    })
    .html(
      `
      ATENÇÃO: número muito grande.<br />
      Esta operação poderá demorar alguns minutos.<br /><br />
      Tem certeza que deseja continuar?<br />
    `
    )
    .append(span);

  $(`#${sectionID}`).append(div);
}

function handleBtnClick(event, params, fn) {
  const action = $(event.target).attr('type');
  const sectionID = params.sectionID;

  $(`#${sectionID} input`).prop('disabled', false);
  $('div.largeNumbersMsg').remove();

  if (action === 'confirm') {
    $(`#${sectionID} .js-result`)
      .removeClass('success error')
      .text('Calculando...')
      .slideDown('slow');
    window.setTimeout(() => {
      calculateAndDisplay(params, fn);
    }, 500);
  } else if (action === 'cancel') {
    cleanInput(sectionID);
  }
}

function cleanInput(sectionID) {
  $(`#${sectionID} input`).val('');
}

function calculateAndDisplay(params, fn) {
  const sectionID = params.sectionID;
  const resultArea = $(`#${sectionID} .js-result`);
  try {
    const msg = fn(...params.inputValuesArray, resultArea);

    resultArea.hide();
    resultArea.text(msg);

    togglePeriod(sectionID, ':');
    toggleIcons(sectionID, 'show');

    resultArea.slideDown('slow');
  } catch (error) {
    Message.display('error', error.message, resultArea);
  }
}

const hasLargeNumber = inputValues => {
  return inputValues.some(number => number >= LIMIT) ? true : false;
};

const getNumberToCalculate = number => {
  const digits = (number + '').length;
  const factor = 3 * 2 ** (digits - 1);

  return number * factor;
};

const handleInputChange = (sectionID, fn) => {
  let inputValuesArray = [];

  for (const input of $(`#${sectionID} input`)) {
    inputValuesArray.push($(input).val());
  }

  const resultArea = $(`#${sectionID} .js-result`);

  if (inputValuesArray.some(value => value === '')) {
    cleanResultArea(sectionID);
  } else {
    try {
      const tmp = [];
      inputValuesArray.forEach(number => {
        tmp.push(validateInput(number));
      });
      inputValuesArray = tmp;
    } catch (error) {
      Message.display('error', error.message, resultArea);
      return false;
    }

    const valuesToCheckLimit =
      sectionID === 'generate-first-n-primes'
        ? [getNumberToCalculate(inputValuesArray[0])]
        : inputValuesArray;

    const action = hasLargeNumber(valuesToCheckLimit)
      ? renderConfirmationArea
      : calculateAndDisplay;

    action(
      {
        sectionID,
        inputValuesArray,
      },
      fn
    );
  }
};

const checkInputValidity = input => {
  let value = input.val();
  if (value !== '' && value.match(/\D+/) !== null) {
    return false;
  }
  return true;
};

function handleInputInput(input, msg = 'Digite um número inteiro positvo.') {
  if (!checkInputValidity(input)) {
    input.get(0).setCustomValidity(msg);
    input.get(0).reportValidity();
    input.attr('style', 'border-color: var(--invalid-input-border)');
  } else {
    input.get(0).setCustomValidity('');
    input.attr('style', 'border-color: var(--input-border)');
  }
}

const primalityCheck = (number, resultArea) => {
  let result = number <= 1 ? false : cachedPrimes(number).isPrime;

  let msg = `${number} `;
  if (result === false) {
    msg += 'não ';
    resultArea.removeClass('success');
  } else {
    resultArea.addClass('success');
  }
  msg += 'é um número primo';

  return msg;
};

const generateListOfPrimes = (from, to) =>
  primeNumbersListBetween(from, to).join(' ');

const listFirstNPrimes = number => firstNPrimes(number).join(' ');

const initInputs = inputs => {
  inputs.forEach((handler, sectionID) => {
    let element = $(`#${sectionID} input`);

    element.keydown(event => {
      if (['Enter', 'Tab'].includes(event.key)) {
        handleInputChange(sectionID, handler);
      }
    });

    element.on('input', event => {
      handleInputInput($(event.target));
    });
  });
};

const cleanResultArea = sectionID => {
  const resultArea = $(`#${sectionID} .js-result`);
  togglePeriod(sectionID, '.');
  toggleIcons(sectionID, 'hide');
  resultArea.slideUp('slow', () => resultArea.html(''));
};

const closeResult = sectionID => {
  cleanInput(sectionID);
  cleanResultArea(sectionID);
};

const toggleResult = sectionID => {
  const resultArea = $(`#${sectionID} .js-result`);
  if (resultArea.is(':visible')) {
    resultArea.slideUp('slow');
    $(`#${sectionID} .icon[type="toggle"]`)
      .removeClass('collapse')
      .addClass('expand');
  } else {
    resultArea.slideDown('slow');
    $(`#${sectionID} .icon[type="toggle"]`)
      .removeClass('expand')
      .addClass('collapse');
  }
};

const initIcons = () => {
  $('.icon').click(event => {
    const icon = $(event.target).is('use')
      ? $(event.target).parent()
      : $(event.target);
    const sectionID = icon.parents('section').attr('id');
    const action = icon.attr('type');

    if (action === 'toggle') {
      toggleResult(sectionID);
    } else if (action === 'close') {
      closeResult(sectionID);
    }
  });
};

const start = () => {
  /**
   * @type {Map.<string, Function>}
   * keys -> ID of the <section> element corresponding to a operation
   * values -> A callback funtion wich performs the operation
   */
  const inputs = new Map([
    ['verify-number', primalityCheck],
    ['generate-list', generateListOfPrimes],
    ['generate-first-n-primes', listFirstNPrimes],
  ]);

  initInputs(inputs);
  initIcons();
};

start();
