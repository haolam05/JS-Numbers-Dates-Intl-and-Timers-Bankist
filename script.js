'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

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
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
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
    '2023-06-21T16:33:06.386Z',
    '2023-06-23T14:43:26.374Z',
    '2023-06-26T18:49:59.371Z',
    '2023-06-27T19:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
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

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (movDate) {
  const calcDaysPassed = (date1InMillisecond, date2InMillisecond) =>
    Math.round(
      Math.abs(date1InMillisecond - date2InMillisecond) / (24 * 60 * 60 * 1000)
    );
  const daysPassed = calcDaysPassed(new Date(), movDate);
  const [date, month, year] = [
    `${movDate.getDate()}`.padStart(2, 0),
    `${movDate.getMonth() + 1}`.padStart(2, 0),
    movDate.getFullYear(),
  ];
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return `${date}/${month}/${year}`;
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach(function (mov, i) {
    const movDate = new Date(account.movementsDates[i]);
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${formatMovementDate(movDate)}</div>
      <div class="movements__value">${mov.toFixed(2)} €</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

const calcPrintBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => (acc += mov));
  labelBalance.textContent = `${account.balance.toFixed(2)} €`;
};

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${income.toFixed(2)} €`;

  const expense = Math.abs(
    account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );
  labelSumOut.textContent = `${expense.toFixed(2)} €`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = interest.toFixed(2);
};

const updateUI = function () {
  displayMovements(currentAccount);
  calcPrintBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

const now = new Date();
const [year, month, date, hour, minute] = [
  now.getFullYear(),
  `${now.getMonth() + 1}`.padStart(2, 0),
  `${now.getDate()}`.padStart(2, 0),
  `${now.getHours()}`.padStart(2, 0),
  `${now.getMinutes()}`.padStart(2, 0),
];
labelDate.textContent = `${date}/${month}/${year}, ${hour}:${minute}`;

// Event Handler
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting (which triggers automatic page reload)
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    updateUI();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    updateUI();
  }
  inputTransferAmount.value = inputTransferTo.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI();
  }
  inputLoanAmount.value = '';
});

let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  isSorted = !isSorted;
  displayMovements(currentAccount, isSorted);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// Numbers
console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
// Conversion
console.log('=== Conversion ===');
console.log(Number('23'), +'23');
// parseInt
console.log('=== parseInt ===');
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e30', 10));
// parseFloat
console.log('=== parseFloat ===');
console.log(Number.parseInt(' 2.5rem', 10));
console.log(Number.parseFloat(' 2.5rem', 10));
// isNaN
console.log('=== isNaN ===');
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
console.log(5 / 0, Number.isNaN(5 / 0));
// isFinite
console.log('=== isFinite ===');
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20x'));
console.log(Number.isFinite(5 / 0));
// isInteger
console.log('=== isInteger ===');
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

// Math and rounding
console.log('=== Math.sqrt ===');
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));
console.log('=== Math.max ===');
console.log(Math.max(1, 2, 3));
console.log(Math.max(1, 2, '3'));
console.log(Math.max(1, 2, '3px'));
console.log('=== Math.min ===');
console.log(Math.min(1, 2, 3));
console.log('=== Math.PI ===');
console.log(Math.PI);
console.log('=== random integer between min and min (inclusive) ===');
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
for (let i = 0; i < 10; i++) {
  console.log(randomInt(4, 7));
}
console.log('=== Math.trunc ===');
console.log(Math.trunc(5.3));
console.log(Math.trunc(5.9));
console.log(Math.trunc(-5.9));
console.log('=== Math.round ===');
console.log(Math.round(5.3));
console.log(Math.round(5.5));
console.log('=== Math.floor ===');
console.log(Math.floor(5.3));
console.log(Math.floor(5.9));
console.log(Math.floor(-5.3));
console.log('=== Math.ceil ===');
console.log(Math.ceil(5.3));
console.log(Math.ceil(5.9));
console.log(Math.ceil(-5.3));
console.log('=== toFixed ===');
console.log((2.5).toFixed(0));
console.log((2.3).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.77).toFixed(3));
console.log((2.777).toFixed(3));
console.log((2.7777).toFixed(3));

// Numeric separator
console.log('=== Numeric separator ===');
console.log(287460000000);
console.log(287_460_000_000);
console.log(3.14_159);
console.log(Number('12345'));
console.log(Number('12_345'));

// BigInt
console.log('=== BigInt ===');
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(BigInt(234567898765432));
console.log(234567898765432n);
console.log(10n + 20n);
console.log(BigInt(10) + 20n);
console.log(20n > 15);
console.log(20n === 20);
console.log(20n == '20');
console.log(11n / 3n);
console.log(11 / 3);

// Date
console.log('=== Date ===');
console.log(new Date());
console.log(Date.now());
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));
const future = new Date(2001, 5, 5, 6, 30, 59); // optional parameters, month is 0 based
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());
console.log(new Date(future.getTime()));
