// Функция проверки, является ли число простым
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

// Функции для окраски текста
const colors = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    reset: "\x1b[0m"
};

// Получаем диапазон из аргументов командной строки
const [start, end] = process.argv.slice(2).map(Number);

if (isNaN(start) || isNaN(end)) {
    console.log(`${colors.red}Ошибка: Аргументы должны быть числами.${colors.reset}`);
    process.exit(1);
}

const primes = [];
for (let i = start; i <= end; i++) {
    if (isPrime(i)) {
        primes.push(i);
    }
}

if (primes.length === 0) {
    console.log(`${colors.red}В указанном диапазоне нет простых чисел.${colors.reset}`);
} else {
    primes.forEach((prime, index) => {
        if (index % 3 === 0) {
            console.log(`${colors.green}${prime}${colors.reset}`);
        } else if (index % 3 === 1) {
            console.log(`${colors.yellow}${prime}${colors.reset}`);
        } else {
            console.log(`${colors.red}${prime}${colors.reset}`);
        }
    });
}
