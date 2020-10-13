import { transform, getSubTreeOf, createCustomMapping } from './kanaMapping';

//WARNING: BUGS GALORE

// NOTE: not exactly kunrei shiki, for example ぢゃ -> dya instead of zya, to avoid name clashing
/* eslint-disable */
// prettier-ignore
const BASIC_KUNREI = { //EXPANDED POLIVANOV
    а: 'あ', и: 'い', у: 'う', э: 'え', е: 'え', о: 'お',
    к: { а: 'か', и: 'き', у: 'く', э: 'け', е: 'け', о: 'こ', },
    с: { а: 'さ', и: 'し', у: 'す', э: 'せ', е: 'せ', о: 'そ', },
    т: { а: 'た', и: 'ち', у: 'つ', э: 'て', е: 'て', о: 'と', },
    н: { а: 'な', и: 'に', у: 'ぬ', э: 'ね', е: 'ね', о: 'の', },
    х: { а: 'は', и: 'ひ', у: 'ふ', э: 'へ', е: 'へ', о: 'ほ', },
    м: { а: 'ま', и: 'み', у: 'む', э: 'め', е: 'め', о: 'も', },
    й: { а: 'や', у: 'ゆ', о: 'よ', },
    р: { а: 'ら', и: 'り', у: 'る', э: 'れ', е: 'れ', о: 'ろ', },
    в: { а: 'わ', и: 'ゐ', э: 'ゑ', е: 'ゑ', о: 'を', },
    г: { а: 'が', и: 'ぎ', у: 'ぐ', э: 'げ', е: 'げ', о: 'ご', },
    дз: { а: 'ざ', и: 'じ', у: 'ず', э: 'ぜ', е: 'ぜ', о: 'ぞ', },//TODO:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    з: { а: 'ざ', и: 'じ', у: 'ず', э: 'ぜ', е: 'ぜ', о: 'ぞ', }, //over polivanov
    д: { а: 'だ', и: 'ぢ', у: 'づ', э: 'で', е: 'で', о: 'ど', },
    б: { а: 'ば', и: 'び', у: 'ぶ', э: 'べ', е: 'べ', о: 'ぼ', },
    п: { а: 'ぱ', и: 'ぴ', у: 'ぷ', э: 'ぺ', е: 'ぺ', о: 'ぽ', }
    //v: { a: 'ゔぁ', i: 'ゔぃ', u: 'ゔ', e: 'ゔぇ', o: 'ゔぉ',} 
  };

const SPECIAL_SYMBOLS = {
  '.': '。',
  ',': '、',
  ':': '：',
  '/': '・',
  '!': '！',
  '?': '？',
  '~': '〜',
  '-': 'ー',
  '‘': '「',
  '’': '」',
  '“': '『',
  '”': '』',
  '[': '［',
  ']': '］',
  '(': '（',
  ')': '）',
  '{': '｛',
  '}': '｝',
};

const CONSONANTS = {
  к: 'き',
  с: 'し',
  ш: 'し', //!!!
  щ: 'し', //!!!
  т: 'ち',
  ч: 'ち', //!!!
  ц: 'ち', // Спальвин
  н: 'に',
  х: 'ひ',
  м: 'み',
  р: 'り',
  г: 'ぎ',
  дз: 'じ',//TODO:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  з: 'じ',//!!!
  д: 'ぢ',
  б: 'び',
  п: 'ぴ',
  //v: 'ゔ',
  //к: 'く', //wtf^2
  ф: 'ふ', //wtf
};
const SMALL_Y = { 
    я: 'ゃ',
    йа: 'ゃ', //weird
    ья: 'ゃ', //weird
    ьйа: 'ゃ', //super weird
    //yi: 'ぃ',
    ю: 'ゅ',
    йу: 'ゅ', //weird
    ью: 'ゅ', //weird
    ьйу: 'ゅ', //super weird
    //ye: 'ぇ',
    ё: 'ょ', //ok
    йо: 'ょ', 
    ьё: 'ょ', //weird
    ьйо: 'ょ' //super weird 
};
const SMALL_VOWELS = { а: 'ぁ', и: 'ぃ', у: 'ぅ', э: 'ぇ', е: 'ぇ', о: 'ぉ' };

// typing one should be the same as having typed the other instead
const ALIASES = {
  ща:'ся',
  щу: 'сю',
  що:'сё',
  ча:'тя',
  чу:'тю',
  чо:'тё',
  дз:'з',
  // exceptions to above rules
  ши: 'си',
  щи: 'си',
  чи: 'ти',
  ци: 'ти', // Спальвин
  тсу: 'ту',
  цу: 'ту',
  фу: 'ху',
  я: 'йа',
  ю: 'йу',
  ё: 'йо',
  джа: 'дзя',
  джо: 'дзё',
  джу: 'дзю',
  джэ: 'дзэ', //хммммм　BETTER REMOVE THAT
  джя: 'дзя',
  джё: 'дзё',
  джю: 'дзю',
  джи: 'дзи',
  жи: 'дзи', //хммммм　BETTER REMOVE THAT TODO: Decide whether we want "ж + vowel" entries
  дже: 'дзэ', //хммммм　BETTER REMOVE THAT

  цзи: 'ди', //Спальвин
  цзу: 'ду', //Спальвин
  цзя: 'дя', //Спальвин
  цзю: 'дю', //Спальвин
  цзйо: 'дё', //Спальвин
  цзё: 'дё', //Позднеев
};

// xtu -> っ
const SMALL_LETTERS = Object.assign(
  {
    /*TODO: This \/
    tu: 'っ',
    wa: 'ゎ',
    ka: 'ヵ',
    ke: 'ヶ',*/
  },
  SMALL_VOWELS,
  SMALL_Y
);

// don't follow any notable patterns
const SPECIAL_CASES = {
  yi: 'い',
  wu: 'う',
  ye: 'いぇ',
  wi: 'うぃ',
  we: 'うぇ',
  kwa: 'くぁ',
  whu: 'う',
  // because it's not thya for てゃ but tha
  // and tha is not てぁ, but てゃ
  tha: 'てゃ',
  thu: 'てゅ',
  tho: 'てょ',
  dha: 'でゃ',
  dhu: 'でゅ',
  dho: 'でょ',
};

const AIUEO_CONSTRUCTIONS = {
  wh: 'う',
  qw: 'く',
  q: 'く',
  gw: 'ぐ',
  sw: 'す',
  ts: 'つ',
  th: 'て',
  tw: 'と',
  dh: 'で',
  dw: 'ど',
  fw: 'ふ',
  f: 'ふ',
};

/* eslint-enable */
function createCyrillicToKanaMap() {
  const kanaTree = transform(BASIC_KUNREI);
  // pseudo partial application
  const subtreeOf = (string) => getSubTreeOf(kanaTree, string);

  // add tya, sya, etc.
  Object.entries(CONSONANTS).forEach(([consonant, yKana]) => {
    Object.entries(SMALL_Y).forEach(([roma, kana]) => {
      // for example kyo -> き + ょ
      subtreeOf(consonant + roma)[''] = yKana + kana;
    });
  });

  Object.entries(SPECIAL_SYMBOLS).forEach(([symbol, jsymbol]) => {
    subtreeOf(symbol)[''] = jsymbol;
  });

  // things like うぃ, くぃ, etc.
  Object.entries(AIUEO_CONSTRUCTIONS).forEach(([consonant, aiueoKana]) => {
    Object.entries(SMALL_VOWELS).forEach(([vowel, kana]) => {
      const subtree = subtreeOf(consonant + vowel);
      subtree[''] = aiueoKana + kana;
    });
  });

  // different ways to write ん
  ['н', "нъ", 'ън'].forEach((nChar) => {
    subtreeOf(nChar)[''] = 'ん';
  });

  //sometimes й = い、but not in йа, йо, йю cases
  subtreeOf('й')[''] = 'い';

  // c is equivalent to k, but not for chi, cha, etc. that's why we have to make a copy of k
  //kanaTree.c = JSON.parse(JSON.stringify(kanaTree.k)); //TODO: DEAL WITH IT

  Object.entries(ALIASES).forEach(([string, alternative]) => {
    const allExceptLast = string.slice(0, string.length - 1);
    const last = string.charAt(string.length - 1);
    const parentTree = subtreeOf(allExceptLast);
    // copy to avoid recursive containment
    parentTree[last] = JSON.parse(JSON.stringify(subtreeOf(alternative)));
  });

  function getAlternatives(string) {
    return [...Object.entries(ALIASES), ...[['c', 'k']]].reduce(
      (list, [alt, roma]) =>
        (string.startsWith(roma) ? list.concat(string.replace(roma, alt)) : list),
      []
    );
  }

  Object.entries(SMALL_LETTERS).forEach(([kunreiRoma, kana]) => {
    const last = (char) => char.charAt(char.length - 1);
    const allExceptLast = (chars) => chars.slice(0, chars.length - 1);
    const xRoma = `x${kunreiRoma}`;
    const xSubtree = subtreeOf(xRoma);
    xSubtree[''] = kana;

    // ltu -> xtu -> っ
    const parentTree = subtreeOf(`l${allExceptLast(kunreiRoma)}`);
    parentTree[last(kunreiRoma)] = xSubtree;

    // ltsu -> ltu -> っ
    getAlternatives(kunreiRoma).forEach((altRoma) => {
      ['l', 'x'].forEach((prefix) => {
        const altParentTree = subtreeOf(prefix + allExceptLast(altRoma));
        altParentTree[last(altRoma)] = subtreeOf(prefix + kunreiRoma);
      });
    });
  });

  Object.entries(SPECIAL_CASES).forEach(([string, kana]) => {
    subtreeOf(string)[''] = kana;
  });

  // add kka, tta, etc.
  function addTsu(tree) {
    return Object.entries(tree).reduce((tsuTree, [key, value]) => {
      if (!key) {
        // we have reached the bottom of this branch
        tsuTree[key] = `っ${value}`;
      } else {
        // more subtrees
        tsuTree[key] = addTsu(value);
      }
      return tsuTree;
    }, {});
  }

  // have to explicitly name c here, because we made it a copy of k, not a reference
  [...Object.keys(CONSONANTS)].forEach((consonant) => { //'c', 'y', 'w', 'j'
    const subtree = kanaTree[consonant];
    subtree[consonant] = addTsu(subtree);
  });

  // nn should not be っん
  delete kanaTree.н.н;
  // solidify the results, so that there there is referential transparency within the tree
  return Object.freeze(JSON.parse(JSON.stringify(kanaTree)));
}

let cyrillicToKanaMap = null;

export function getCyrillicToKanaTree() {
  if (cyrillicToKanaMap == null) {
    cyrillicToKanaMap = createCyrillicToKanaMap();
  }
  return cyrillicToKanaMap;
}

export const USE_OBSOLETE_KANA_MAP = createCustomMapping({ wi: 'ゐ', we: 'ゑ' });

export function IME_MODE_MAP(map) {
  // in IME mode, we do not want to convert single ns
  const mapCopy = JSON.parse(JSON.stringify(map));
  mapCopy.н.н = { '': 'ん' };
  mapCopy.н[' '] = { '': 'ん' };
  return mapCopy;
}
