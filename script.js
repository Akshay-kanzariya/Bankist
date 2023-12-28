'use strict';

// BANKIST APP

//data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-12-16T17:01:17.194Z',
    '2023-12-17T23:36:17.929Z',
    '2023-12-18T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2023-12-16T14:43:26.374Z',
    '2023-12-17T18:49:59.371Z',
    '2023-12-18T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

//selecting Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// creating user names for login
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);
// after this the username for accunt1 will be 'js' and for accunt2 it will be 'jd'

let currentAccount, timer;

// using timer to logout for a prolonged inactivity
const startTimer = function () {
  let time = 300;
  const firstTick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };
  firstTick();
  const timer = setInterval(firstTick, 1000);

  return timer;
};

// function to update user interface
const updateUi = function (currentAccount) {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

//formatting the dates of movements according to 'locale' format
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

//formatting the dates of movements according to 'currency' format
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// displaying transections to the user interface
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort(function (a, b) {
        return a - b;
      })
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//displaying the total balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

//displaying the total deposits, withdrawals, and interest
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)
    .toFixed(2);

  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const outing = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  ).toFixed(2);
  labelSumOut.textContent = formatCurrency(outing, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0)
    .toFixed(2);

  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

// adding functionality to login button
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    updateUi(currentAccount);
  }

  inputLoginPin.blur();
  if (timer) clearInterval(timer);
  timer = startTimer();
});

// adding functionality to amount-transfer button
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiverAcc &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    updateUi(currentAccount);
  }

  if (amount < 0) alert(`transfer amount can't be negative.`);
  if (!receiverAcc) alert(`error finding the receiver account`);
  inputTransferAmount.blur();

  clearInterval(timer);
  timer = startTimer();
});

// adding functionality to loan button
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loan = Number(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= loan * 0.1)) {
    currentAccount.movements.push(loan);
    inputLoanAmount.value = '';
    currentAccount.movementsDates.push(new Date());
    setTimeout(function () {
      updateUi(currentAccount);
      clearInterval(timer);
      timer = startTimer();
    }, 3000);
  }

  if (loan < 0) alert(`loan amount can't be negative.`);
  inputLoanAmount.blur();
});

// adding functionality to close-account button
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const closeAccUser = inputCloseUsername.value;
  const closeAccPin = Number(inputClosePin.value);

  if (closeAccUser === currentAccount.username) {
    if (currentAccount.pin === closeAccPin) {
      alert(`are you sure that you wan to delete ${currentAccount.owner}?`);
      const index = accounts.findIndex(function (account) {
        return account.username === closeAccUser;
      });
      accounts.splice(index, index + 1);
      containerApp.style.opacity = 0;
    }

    if (currentAccount.pin !== closeAccPin) alert(`wrong pin.`);
  } else alert(`mistake in username`);

  inputCloseUsername.value = inputClosePin.value = '';
});

// adding functionality to sorting-movements button
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
