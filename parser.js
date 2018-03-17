// Google Spread SheetをAPI利用するためのAPIキー
// Google Could PlatformでSpread Sheet API有効化して発行（※公開時は制限に要注意！）
const API_KEY = 'DUMMYaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

// ステージ読み込み
const loadStages = async () => {
    // ステージエリアの読み込み範囲定義
    // 「評価点」シートの左上セルから右下セルまで
    // コロッセオはテーブルの下に値入力されたセルがあるので、下限の行番号まで忘れずに入れる
    // 他は省略した方が追加データに対応できて楽
    const STAGE_AREA_COLOSSEUM = 'A2:J35'; 
    const STAGE_AREA_GUILD = 'K2:T';
    const STAGE_AREA_EVENT = 'U2:AD';
    const STAGE_AREA_NORMAL = 'AE2:AN';

    // データを取得するためのURL
    // 結果はJSON
    //const url = 'https://sheets.googleapis.com/v4/spreadsheets/1O1hD48IWzzpGDwKOYlAraTCdO0EzfO1uRrKZ1Ut1luA/values/%e8%a9%95%e4%be%a1%e7%82%b9!' + STAGE_AREA_COLOSSEUM + '?key=' + API_KEY;
    
    // できあがったものがこちら（サンプルなので2件だけ）
    const url = './stageSample.json';
    const response = await fetch(url);
    return await response.json();
}


// アイテム読み込み
const loadItems = async () => {
    // アイテムシート名
    const ITEM_CATEGORY_NAME = 'ヘアスタイル';

    // データを取得するためのURL
    // 結果はJSON
    // const url = 'https://sheets.googleapis.com/v4/spreadsheets/1O1hD48IWzzpGDwKOYlAraTCdO0EzfO1uRrKZ1Ut1luA/values/' + encodeURIComponent(ITEM_CATEGORY_NAME) + '!B2:R?key=' + API_KEY;

    // できあがったものがこちら（サンプルなので2件だけ）
    const url = './itemSample.json';
    const response = await fetch(url);
    return await response.json();
}

// ステージデータの整形
const parseStages = (stages = []) => {
    let parsedStages = [];
    let name = '';
    let styleType = [];
    let tagType = [];
    let i = 1;
    for (const stage of stages.values) {
        if (i%2 === 1) {
            // 奇数行
            // アイテム名
            name = stage[0];
            //スタイルの種類
            styleType = [
                stage[1],
                stage[2],
                stage[3],
                stage[4],
                stage[5],
            ];
            // タグの種類。空でも入れる
            tagType = [
                stage[6],
                stage[8]
            ];
        } else {
            // 偶数行
            // スタイルの種類に倍率を入れる
            const styles = new Map([
                [styleType[0], stage[1]],
                [styleType[1], stage[2]],
                [styleType[2], stage[3]],
                [styleType[3], stage[4]],
                [styleType[4], stage[5]]
            ]);
            // タグの種類にランクと倍率を入れる
            const tags = new Map([
                [tagType[0], [stage[7], stage[8]]],
                [tagType[1], [stage[9], stage[8]]],
            ]);

            parsedStages.push({
                name         : name,
                styles       : styles,
                tags         : tags
            });
        }
        i++;
    }
    return parsedStages;
};

// アイテムデータの整形
const parseItems = (items) => {
    let parsedITems = [];
    for (const item of items.values) {
        const styles = new Map([
            [item[5],    item[6]],
            [item[7],    item[8]],
            [item[9],    item[10]],
            [item[11], item[12]],
            [item[13], item[14]]
        ]);
        const tags = [];
        if (item[15]) tags.push(item[15]);
        if (item[16]) tags.push(item[16]);
        parsedITems.push({
            itemCategory: item[2]+item[3],
            id          : item[0],
            name        : item[1],
            styles      : styles,
            tags        : tags
        });
    }
    return parsedITems;
}

// Mapをjson表示するためにObject変換
// 使う分には無視して大丈夫です
const mixedMapToObject = (targets) => {
    const convert = (map) => ([...map].reduce((l,[k,v]) => Object.assign(l, {[k]:v}), {}));
    let results = [];
    for (const target of targets) {
        target.styles = convert(target.styles);
        if (target.tags instanceof Map) {
            target.tags = convert(target.tags);
        }
        results.push(target);
    }
    return results;
}

//
// ここからメイン処理
//

// ステージ処理
loadStages().then(stages => {
  // Google Spread Sheet API実行結果イメージ
  console.log(stages);
  document.getElementById('plainStageJSON').innerText = JSON.stringify(stages, null, '  ');

  // 変換後イメージ
  const parsedStageJSON = parseStages(stages);
  console.log(parsedStageJSON);
  document.getElementById('parsedStageJSON').innerText = JSON.stringify(mixedMapToObject(parsedStageJSON), null, '  ');
});

// アイテム処理
loadItems().then(items => {
  // Google Spread Sheet API実行結果イメージ
  console.log(items);
  document.getElementById('plainItemJSON').innerText = JSON.stringify(items, null, '  ');

  // 変換後イメージ
  const parsedItemJSON = parseItems(items);
  console.log(parsedItemJSON);
  document.getElementById('parsedItemJSON').innerText = JSON.stringify(mixedMapToObject(parsedItemJSON), null, '  ');
});

