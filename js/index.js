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
    /** Displays only if there isn't already a message in MessageArea */
    if (!messageArea.hasClass(`${type}`)) {
      messageArea
        .hide()
        .removeClass(['success error'].find(name => name !== type))
        .text(`${message}`)
        .addClass(`msg ${type}`);

      let isListResult = false;
      if (messageArea.hasClass('listResult')) {
        messageArea.removeClass('listResult');
        isListResult = true;
      }

      const sectionID = messageArea.parent().attr('id');
      togglePunctuationMark(sectionID, ':');
      toggleIcons(sectionID, 'hide');

      messageArea.slideDown('slow', async () => {
        await asyncTimeout(2000);
        messageArea.slideUp('slow', () =>
          cleanResultArea(messageArea.parents('section').attr('id'))
        );

        isListResult ? messageArea.addClass('listResult') : null;
      });
    }
  }
}

function validateInput(value, message = 'Digite um número inteiro positivo.') {
  const parsedValue = parseInt(value);

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

const togglePunctuationMark = (sectionID, char) => {
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

  $(`#${sectionID} .js-result`).empty().slideUp('slow');
  $(`#${sectionID} input`).prop('disabled', true);
  toggleIcons(sectionID, 'hide');

  const confirmBtn = $('<button>')
    .attr({
      id: `${sectionID}-confirm-btn`,
      class: 'button',
      type: 'confirm',
      text: 'Confirmar',
    })
    .html('Confirmar')
    .click(event => handleBtnClick(event, params, fn));

  const cancelBtn = $('<button>')
    .attr({
      id: `${sectionID}-cancel-btn`,
      class: 'button',
      type: 'cancel',
      text: 'Cancelar',
    })
    .html('Cancelar')
    .click(event => handleBtnClick(event, params, fn));

  const span = $('<span>').addClass('btn-wrapper');
  span.append(confirmBtn).append(cancelBtn);

  const div = $('<div>')
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
    calculateAndDisplay(params, fn);
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

  if (
    resultArea.attr('value') !== params.inputValuesArray + '' ||
    !resultArea.is(':visible')
  ) {
    resultArea
      .hide()
      .removeClass('success error')
      .text('Calculando...')
      .slideDown('slow', () => {
        try {
          const msg = fn(...params.inputValuesArray, resultArea);

          resultArea.fadeOut(() => resultArea.text(msg).fadeIn('slow'));

          togglePunctuationMark(sectionID, ':');
          toggleIcons(sectionID, 'show');

          resultArea.attr('value', params.inputValuesArray);
        } catch (error) {
          Message.display('error', error.message, resultArea);
        }
      });
  }
}

const getNumberToCalculate = number => {
  const digits = (number + '').length;
  const factor = 3 * 2 ** (digits - 1);

  return number * factor;
};

const handleInputChange = (sectionID, fn) => {
  let inputValuesArray = $.map($(`#${sectionID} input`), input =>
    $(input).val()
  );

  const resultArea = $(`#${sectionID} .js-result`);

  if (inputValuesArray.some(value => value === '')) {
    cleanResultArea(sectionID);
  } else {
    try {
      inputValuesArray = inputValuesArray.map(number => validateInput(number));
    } catch (error) {
      Message.display('error', error.message, resultArea);
      return false;
    }

    const valuesToCheckLimit =
      sectionID === 'generate-first-n-primes'
        ? [getNumberToCalculate(...inputValuesArray)]
        : inputValuesArray;

    const action = valuesToCheckLimit.some(number => number >= LIMIT)
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

const containsNonDigitCharacter = input => input.val().match(/\D+/) !== null;

function handleInputInput(input, msg = 'Digite um número inteiro positvo.') {
  if (containsNonDigitCharacter(input)) {
    input.get(0).setCustomValidity(msg);
    input.get(0).reportValidity();
    input.attr('style', 'border-color: var(--invalid-input-border)');
  } else {
    input.get(0).setCustomValidity('');
    input.attr('style', 'border-color: var(--input-border)');
  }
}

const primalityCheck = (number, resultArea) => {
  const result = number <= 1 ? false : cachedPrimes(number).isPrime;

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
    $(`#${sectionID} input`)
      .keydown(event => {
        if (['Enter', 'Tab'].includes(event.key)) {
          handleInputChange(sectionID, handler);
        }
      })
      .on('input', event => {
        handleInputInput($(event.target));
      });
  });
};

const cleanResultArea = sectionID => {
  const resultArea = $(`#${sectionID} .js-result`);
  togglePunctuationMark(sectionID, '.');
  toggleIcons(sectionID, 'hide');
  resultArea.slideUp('slow', () =>
    resultArea.empty().removeClass('msg success error')
  );
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
    /** Sometimes the event will be trigged by the child element <use> */
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
