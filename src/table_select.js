"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Separator = void 0;
const {Separator,makeTheme, useEffect, usePrefix, usePagination, 
    createPrompt, useRef, useState, useMemo, useKeypress, 
    isDownKey, isUpKey, isEnterKey, isSpaceKey, isNumberKey,
    ValidationError } = require("@inquirer/core");
const colors = __importDefault(require("yoctocolors-cjs"));
const figures = __importDefault(require("@inquirer/figures"));
const ansi_escapes = __importDefault(require("ansi-escapes"));

const checkboxTheme = {
    icon: {
        checked: colors.default.green(figures.default.radioOn),
        unchecked: figures.default.radioOff,
        cursor: figures.default.pointer,
    },
    style: {
        disabledChoice: (text) => colors.default.dim(` ${text}`),
        renderSelectedChoices: (selectedChoices) => selectedChoices
            .map((choice) => { var _a, _b; return (_b = (_a = choice.short) !== null && _a !== void 0 ? _a : choice.name) !== null && _b !== void 0 ? _b : choice.value; })
            .join(', '),
    },
    helpMode: 'auto',
};
function isSelectable(item) {
    return !Separator.isSeparator(item) && !item.disabled;
}
function isChecked(item) {
    return isSelectable(item) && Boolean(item.checked);
}
function toggle(item) {
    return isSelectable(item) ? Object.assign(Object.assign({}, item), { checked: !item.checked }) : item;
}
function check(checked) {
    return function (item) {
        return isSelectable(item) ? Object.assign(Object.assign({}, item), { checked }) : item;
    };
}

function isRightKey(key) {
    return key.name == 'right';
}
function isLeftKey(key) {
    return key.name == 'left';
}

function chunkArray(array, chunkSize) {
    let chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

exports.default = createPrompt((config, done) => {
    const { instructions, pageSize = 7, loop = true, choices, required, validate = () => true, column = 5 } = config;
    const theme = makeTheme(checkboxTheme, config.theme);
    const prefix = usePrefix({ theme });
    const firstRender = useRef(true);
    const [status, setStatus] = useState('pending');
    const [items, setItems] = useState(choices.map((choice, i) => (Object.assign({index:i}, choice))));
    const bounds = useMemo(() => {
        const first = items.findIndex(isSelectable);
        const last = items.findLastIndex(isSelectable);
        if (first < 0) {
            throw new ValidationError('[checkbox prompt] No selectable choices. All choices are disabled.');
        }
        return { first, last };
    }, [items]);
    const [active, setActive] = useState(bounds.first);
    const [showHelpTip, setShowHelpTip] = useState(true);
    const [errorMsg, setError] = useState();

    useKeypress((key) => __awaiter(void 0, void 0, void 0, function* () {
        if (isEnterKey(key)) {
            const selection = items.filter(isChecked);
            const isValid = yield validate([...selection]);
            if (required && !items.some(isChecked)) {
                setError('At least one choice must be selected');
            }
            else if (isValid === true) {
                setStatus('done');
                done(selection.map((choice) => choice.value));
            }
            else {
                setError(isValid || 'You must select a valid value');
            }
        }
        else if (isUpKey(key) || isDownKey(key)) {
            if (loop ||
                (isUpKey(key) && (active-column) >= bounds.first) ||
                (isDownKey(key) && (active + column) <= bounds.last)) {
                const offset = isUpKey(key) ? -column : column;
                let next = active;
                do {
                    next = (next + offset + items.length) % items.length;
                } while (!isSelectable(items[next]));
                setActive(next);
            }
        } else if(isRightKey(key) || isLeftKey(key)) {
            if (loop ||
                (isLeftKey(key) && active !== bounds.first) ||
                (isRightKey(key) && active !== bounds.last)) {
                const offset = isLeftKey(key) ? -1 : 1;
                let next = active;
                do {
                    next = (next + offset + items.length) % items.length;
                } while (!isSelectable(items[next]));
                setActive(next);
            }
        } else if (isSpaceKey(key)) {
            setError(undefined);
            // setShowHelpTip(false);
            setItems(items.map((choice, i) => (i === active ? toggle(choice) : choice)));
        } else if (key.name === 'a') {
            const selectAll = items.some((choice) => isSelectable(choice) && !choice.checked);
            setItems(items.map(check(selectAll)));
        } else if (key.name === 'i') {
            setItems(items.map(toggle));
        } else if (isNumberKey(key)) {
            // Adjust index to start at 1
            const position = Number(key.name) - 1;
            const item = items[position];
            if (item != null && isSelectable(item)) {
                setActive(position);
                setItems(items.map((choice, i) => (i === position ? toggle(choice) : choice)));
            }
        } else if (key.name === 'c') {
            let lastSelection = active - 1;
            for(; lastSelection > 0; lastSelection--) {
                if (items[lastSelection].checked) break;
            }
            setItems(items.map((item, i) => {
                return (isSelectable(item) && i >= lastSelection && i <= active) ? Object.assign({}, item, {checked: true}) : item;
            }));
        }
    }));
    let byColumn = chunkArray(items, column);
    const message = theme.style.message(config.message);
    const page = usePagination({
        items: byColumn,
        active: Math.floor(active / column),
        renderItem({ item }) {
            let mline = '';
            let columnItems = item;
            for(let i = 0; i < columnItems.length; i++) {
                let item = columnItems[i];
                let isActive = item.index == active;
                if (Separator.isSeparator(item)) {
                    return ` ${item.separator}`;
                }
                const line = String(item.name || item.value);
                // if (item.disabled) {
                    // const disabledLabel = typeof item.disabled === 'string' ? item.disabled : '(disabled)';
                    // return theme.style.disabledChoice(`${line} ${disabledLabel}`);
                // }
                const checkbox = item.checked ? theme.icon.checked : theme.icon.unchecked;
                const color = isActive ? theme.style.highlight : (x) => x;
                const cursor = isActive ? theme.icon.cursor : ' ';
                if (item.disabled) {
                    mline += color(`${theme.style.disabledChoice(line)}`) + ' ';
                } else {
                    mline += color(`${cursor}${checkbox} ${line}`) + ' ';
                }
            }
            return mline;
        },
        pageSize,
        loop,
    });
    if (status === 'done') {
        const selection = items.filter(isChecked);
        const answer = theme.style.answer(theme.style.renderSelectedChoices(selection, items));
        return `${prefix} ${message} ${answer}`;
    }
    let helpTipTop = '';
    let helpTipBottom = '';
    if (theme.helpMode === 'always' ||
        (theme.helpMode === 'auto' &&
            showHelpTip &&
            (instructions === undefined || instructions))) {
        if (typeof instructions === 'string') {
            helpTipTop = instructions;
        }
        else {
            const keys = [
                `${theme.style.key('space')} to select`,
                `${theme.style.key('a')} to toggle all`,
                `${theme.style.key('i')} to invert selection`,
                `${theme.style.key('c')} to select to last checked`,
                `and ${theme.style.key('enter')} to proceed`,
            ];
            helpTipTop = ` (Press ${keys.join(', ')})`;
        }
        if (items.length > pageSize &&
            (theme.helpMode === 'always' ||
                (theme.helpMode === 'auto' && firstRender.current))) {
            helpTipBottom = `\n${theme.style.help('(Use arrow keys to reveal more choices)')}`;
            firstRender.current = false;
        }
    }
    let error = '';
    if (errorMsg) {
        error = `\n${theme.style.error(errorMsg)}`;
    }
    return `${prefix} ${message}${helpTipTop}\n${page}${helpTipBottom}${error}${ansi_escapes.default.cursorHide}`;
});
var core_2 = require("@inquirer/core");
Object.defineProperty(exports, "Separator", { enumerable: true, get: function () { return core_2.Separator; } });

/*
async function main() {
// And it is then called as
let input = exports.default;
let choices = new Array(100).fill(0).map((_, i) => {
    return {name: `Chapter ${i}`, value: i, description: `Chapter ${i}`};
});
// choices[1].disabled = true;
const answer = await input({
    message: 'Select chapters to download',
    choices: choices,
    // pageSize: 20
    column: 8,
    loop: false,
    // helpMode: 'always'
});
console.log(answer);
}

main().catch(console.error);
*/