# 🚢 Sea Battle - Modern Version

Refactored version of the classic "Sea Battle" game using modern JavaScript (ES6+) standards and modular architecture.

## 🎯 Features

- ✅ **Modern JavaScript**: ES6+ classes, modules, async/await
- ✅ **Modular Architecture**: Clear separation of concerns
- ✅ **Smart AI**: Algorithm with "hunt" and "target" modes
- ✅ **Enhanced UI**: Informative messages and input validation
- ✅ **Error Handling**: Robust validation and exception handling
- ✅ **Classic Mechanics**: Preserved original gameplay logic

## 🎮 Game Rules

- Game board size 10×10 cells
- Each player has 3 ships of 3 cells each
- Goal: sink all opponent ships
- Coordinate input in format `row-column` (e.g., `34`, `07`)
- Board symbols:
  - `~` - water
  - `S` - your ship
  - `X` - hit
  - `O` - miss

## 🚀 Quick Start

### Requirements
- Node.js version 14.0.0 or higher

### Installation and Running
```bash
# Clone or download project files
cd task-7

# Run the game
npm start

# Or directly through Node.js
node seabattle-modern.js
```

## 📁 Project Structure

```
task-7/
├── utils.js              # Utility functions and constants
├── ship.js               # Ship class
├── board.js              # Game board class
├── ai-player.js          # AI player class
├── game-ui.js            # User interface
├── seabattle-game.js     # Main game logic
├── seabattle-modern.js   # Application entry point
├── package.json          # Node.js configuration
├── prompt.md             # Original task
├── refactoring.md        # Refactoring documentation
└── README.md             # This file
```

## 🛠 Architecture

### Main Components

1. **Utils** - Utility functions, constants, validation
2. **Ship** - Ship class with hit and sinking logic
3. **Board** - Game board with ship placement and shot processing
4. **AiPlayer** - AI with smart ship search and destroy strategy
5. **GameUI** - User interface and interaction
6. **SeaBattleGame** - Main game controller

### Design Patterns

- **Modularity**: Each component in a separate file
- **Encapsulation**: State and methods unified in classes
- **Separation of Concerns**: Clear division of logic, UI, and data
- **Composition**: Components interact through interfaces

## 🎯 Game Logic

### AI Opponent
- **"Hunt" mode**: Random shots to find ships
- **"Target" mode**: Targeted shots after a hit
- **Smart queue**: Prioritizing adjacent cells after hits

### Ship Placement
- Automatic random placement
- Collision and boundary checking
- Support for horizontal and vertical orientation

## 🔧 Technical Improvements

### ES6+ Features
- Classes instead of constructor functions
- Modules (import/export)
- Constants (const/let) instead of var
- Arrow functions
- Template strings
- Destructuring
- Async/await for asynchronicity

### Performance
- Set for O(1) lookups
- Optimized algorithms
- Prevention of infinite loops
- Efficient memory management

### Reliability
- Validation of all input data
- Exception handling
- Proper termination on interruption
- Informative error messages

## 🎨 Comparison with Original

### What improved:
- 📦 Modular architecture instead of monolithic code
- 🎯 ES6+ syntax instead of outdated JavaScript
- 🛡️ Robust error handling and validation
- 🧠 Improved AI algorithm
- 📖 Detailed documentation and comments
- 🔧 Better testability and maintainability

### What remained:
- 🎮 Exactly the same gameplay mechanics
- 📏 10×10 board size
- ⚓ 3 ships of 3 cells each
- 🎯 Coordinate input format
- 🤖 AI logic (hunt/target)

## 🚀 Development

### Development Mode
```bash
# Run with debugger
npm run dev
```

### Adding New Features
Modular architecture allows easy:
- Adding new ship types
- Changing board size
├── utils.js              # Утилитарные функции и константы
├── ship.js               # Класс корабля
├── board.js              # Класс игрового поля
├── ai-player.js          # Класс ИИ-игрока
├── game-ui.js            # Пользовательский интерфейс
├── seabattle-game.js     # Основная игровая логика
├── seabattle-modern.js   # Точка входа в приложение
├── package.json          # Конфигурация Node.js
├── prompt.md             # Исходное задание
├── refactoring.md        # Документация по рефакторингу
└── README.md             # Этот файл
```

## 🛠 Архитектура

### Основные компоненты

1. **Utils** - Утилитарные функции, константы, валидация
2. **Ship** - Класс корабля с логикой попаданий и потопления
3. **Board** - Игровое поле с размещением кораблей и обработкой выстрелов
4. **AiPlayer** - ИИ с умной стратегией поиска и уничтожения кораблей
5. **GameUI** - Пользовательский интерфейс и взаимодействие
6. **SeaBattleGame** - Основной игровой контроллер

### Паттерны проектирования

- **Модульность**: Каждый компонент в отдельном файле
- **Инкапсуляция**: Состояние и методы объединены в классах
- **Разделение ответственности**: Четкое разделение логики, UI и данных
- **Композиция**: Компоненты взаимодействуют через интерфейсы

## 🎯 Игровая логика

### ИИ противник
- **Режим "охота"**: Случайные выстрелы для поиска кораблей
- **Режим "прицеливание"**: Целенаправленные выстрелы после попадания
- **Умная очередь**: Приоритизация соседних клеток после попадания

### Размещение кораблей
- Автоматическое случайное размещение
- Проверка коллизий и границ поля
- Поддержка горизонтальной и вертикальной ориентации

## 🔧 Технические улучшения

### ES6+ возможности
- Классы вместо функций-конструкторов
- Модули (import/export)
- Константы (const/let) вместо var
- Стрелочные функции
- Шаблонные строки
- Деструктуризация
- Async/await для асинхронности

### Производительность
- Set для O(1) поиска попыток
- Оптимизированные алгоритмы
- Предотвращение бесконечных циклов
- Эффективное управление памятью

### Надежность
- Валидация всех входных данных
- Обработка исключений
- Корректное завершение при прерывании
- Информативные сообщения об ошибках

## 🎨 Сравнение с оригиналом

### Что улучшилось:
- 📦 Модульная архитектура вместо монолитного кода
- 🎯 ES6+ синтаксис вместо устаревшего JavaScript
- 🛡️ Надежная обработка ошибок и валидация
- 🧠 Улучшенный алгоритм ИИ
- 📖 Подробная документация и комментарии
- 🔧 Лучшая тестируемость и поддерживаемость

### Что сохранилось:
- 🎮 Точно такая же игровая механика
- 📏 Размер поля 10×10
- ⚓ 3 корабля по 3 клетки
- 🎯 Формат ввода координат
- 🤖 Логика ИИ (охота/прицеливание)

## 🚀 Разработка

### Режим разработки
```bash
# Запуск с отладчиком
npm run dev
```

### Добавление новых функций
Модульная архитектура позволяет легко:
- Добавлять новые типы кораблей
- Изменять размер поля
- Создавать новые режимы игры
- Улучшать алгоритм ИИ
- Добавлять новые интерфейсы

## 📄 Лицензия

MIT License - свободное использование и модификация.

## 👥 Вклад в проект

Приветствуются улучшения и дополнения! Основные области для развития:
- Добавление тестов
- Улучшение алгоритма ИИ
- Веб-интерфейс
- Сетевая игра
- Дополнительные режимы игры

---

*Рефакторинг выполнен с целью демонстрации современных практик JavaScript-разработки при сохранении классической игровой механики.* 