// 學習3程式碼所在
let circles = []; // 用來儲存所有圓的資料（背景氣球）
let poppingBalloons = []; // 用來儲存會爆破的主要氣球
let colors = ['#0081a7', '#00afb9', '#fdfcdc', '#fed9b7', '#f07167']; // 可選顏色
let explosionSound; // 爆破音效變數
let audioReady = false; // 新增狀態：追蹤音效是否已啟用 (必須由使用者點擊)

// 預載入音效
function preload() {
    // 請將檔名加上副檔名並確認檔案在專案資料夾
    // 範例：'soft-balloon-pop-88692.mp3'
    // 註：請確保您已將 p5.sound 函式庫加入專案。
    explosionSound = loadSound('soft-balloon-pop-88692.mp3'); 
}

/**
 * 建立一個擁有爆破所需屬性的氣球物件
 * @returns {object} 新的氣球物件
 */
function createExplosionBalloon() {
    let r = random(30, 120);
    let alpha = random(50, 255);
    let baseColor = color(random(colors));
    baseColor.setAlpha(alpha);
    let speed = map(r, 30, 120, 2.5, 0.5);
    let boxSize = r * random(0.15, 0.22);
    let boxOffset = r * 0.22;
    
    // 將氣球的起始 Y 座標放在畫面下方，確保它能完整飄起
    let startY = height + r; 

    return {
        x: random(width),
        y: startY, 
        r: r,
        col: baseColor,
        speed: speed,
        boxSize: boxSize,
        boxOffset: boxOffset,
        exploding: false,
        baseR: r,
        timer: 0,
        // 每次重設時，隨機決定一個爆破高度 (30% 到 90% 的畫布高度)
        explosionThresholdY: random(height * 0.3, height * 0.9) 
    };
}


function setup() {
    // 建立全螢幕畫布
    createCanvas(windowWidth, windowHeight);
    
    // 產生 90 個圓（背景氣球，只負責飄動）
    for (let i = 0; i < 90; i++) {
        let x = random(width);
        let y = random(height);
        let r = random(30, 120);
        let alpha = random(50, 255);
        let baseColor = color(random(colors));
        baseColor.setAlpha(alpha);
        let speed = map(r, 30, 120, 2.5, 0.5);
        let boxSize = r * random(0.15, 0.22);
        let boxOffset = r * 0.22;
        circles.push({x, y, r, col: baseColor, speed, boxSize, boxOffset});
    }

    // *** 爆破圓（主要氣球）的初始化：建立多個會爆破的氣球 ***
    const numPoppingBalloons = 3; // 設定要有多少氣球會爆破
    for (let i = 0; i < numPoppingBalloons; i++) {
        let newBalloon = createExplosionBalloon();
        // 錯開它們的起始 Y 座標，讓它們不要同時出現
        newBalloon.y += i * height * 0.3; 
        poppingBalloons.push(newBalloon);
    }
    
    // 在音效啟用前，暫停 draw 迴圈
    noLoop(); 
}

function draw() {
    // 檢查音效是否已啟用
    if (!audioReady) {
        // 顯示引導使用者點擊的畫面
        background('#282c34'); // 深色背景
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(36);
        // 提示文字修改為更直接的「點擊開始」
        text("點擊螢幕開始氣球派對！", width / 2, height / 2);
        textSize(18);
        text("（您的點擊將同時啟用音效）", width / 2, height / 2 + 50);
        return;
    }

    // --- 正常動畫開始 ---
    background('#e2f6f7ff');
    noStroke();

    // *** 左上角文字顯示 (414730571) ***
    fill(50); // 設定文字顏色為深灰色
    textAlign(LEFT, TOP); // 設定文字對齊方式為左上角
    textSize(15); // 設定文字大小為 15px
    text("414730571", 10, 10); // 繪製文字，座標 (10, 10)
    // **********************************

    // 畫飄動圓（背景氣球）
    for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        fill(c.col);
        ellipse(c.x, c.y, c.r, c.r);

        let boxX = c.x + c.boxOffset;
        let boxY = c.y - c.boxOffset;
        fill(255, 255, 255, 120);
        rect(boxX, boxY, c.boxSize, c.boxSize, 4);

        c.y -= c.speed;
        if (c.y + c.r / 2 < 0) {
            c.y = height + c.r / 2;
        }
    }

    // *** 畫爆破圓（會爆破的氣球） - 迴圈處理所有氣球 ***
    for (let i = 0; i < poppingBalloons.length; i++) {
        let balloon = poppingBalloons[i];

        if (!balloon.exploding) {
            // 正常飄動
            fill(balloon.col);
            ellipse(balloon.x, balloon.y, balloon.r, balloon.r);

            // 高光
            let boxX = balloon.x + balloon.boxOffset;
            let boxY = balloon.y - balloon.boxOffset;
            fill(255, 255, 255, 120);
            rect(boxX, boxY, balloon.boxSize, balloon.boxSize, 4);

            // 飄動
            balloon.y -= balloon.speed;
            
            // 達到隨機設定的爆破高度
            if (balloon.y < balloon.explosionThresholdY) { 
                balloon.exploding = true;
                balloon.baseR = balloon.r;
                balloon.timer = 0;
                // 爆破時讓氣球在當前 X 座標爆開，而不是強制移到畫面中間
                // balloon.x = width / 2; 

                // 爆破音效播放點
                if (explosionSound.isLoaded()) {
                    explosionSound.play();
                }
            }
            if (balloon.y + balloon.r / 2 < 0) {
                // 若沒爆破就直接回到底下 (理論上不太會發生)
                poppingBalloons[i] = createExplosionBalloon();
            }
        } else {
            // 爆破動畫：多圈擴散圓環
            let t = balloon.timer;
            let maxT = 16;
            let currR = balloon.baseR + t * 18;
            let currAlpha = map(t, 0, maxT, alpha(balloon.col), 0);

            // 多圈擴散效果
            for (let j = 0; j < 3; j++) {
                let ringR = currR * (1 + j * 0.4);
                let ringAlpha = currAlpha * (0.5 - j * 0.15);
                noFill();
                stroke(red(balloon.col), green(balloon.col), blue(balloon.col), ringAlpha);
                strokeWeight(8 - j * 2);
                ellipse(balloon.x, balloon.y, ringR, ringR);
            }
            noStroke();

            // 主圓
            fill(red(balloon.col), green(balloon.col), blue(balloon.col), currAlpha);
            ellipse(balloon.x, balloon.y, currR * 0.7, currR * 0.7);

            // 高光
            let boxX = balloon.x + balloon.boxOffset * (currR / balloon.baseR);
            let boxY = balloon.y - balloon.boxOffset * (currR / balloon.baseR);
            fill(255, 255, 255, currAlpha * 0.7);
            rect(boxX, boxY, balloon.boxSize * (currR / balloon.baseR), balloon.boxSize * (currR / balloon.baseR), 6);

            balloon.timer++;
            if (balloon.timer > maxT) {
                // 爆破結束，重設氣球
                poppingBalloons[i] = createExplosionBalloon();
            }
        }
    }
}

// 處理視窗大小改變
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重設 explosion 位置以適應新尺寸，但保留狀態
    if (!audioReady) {
        // 如果還沒開始，重新繪製啟動畫面
        redraw();
    }
    // 重新計算爆破門檻，讓爆破點適應新尺寸
    for (let balloon of poppingBalloons) {
        if (!balloon.exploding) {
            balloon.explosionThresholdY = random(height * 0.3, height * 0.9);
        }
    }
}

// 處理滑鼠點擊 (或觸碰)
function mousePressed() {
    if (!audioReady) {
        // 這是唯一一次允許音效啟用的機會
        userStartAudio().then(() => {
            audioReady = true;
            loop(); // 恢復 draw 迴圈
        }).catch(err => {
            // 如果啟用音效失敗，仍然開始動畫，但音效可能無效
            console.error("Audio unlock failed:", err);
            audioReady = true;
            loop();
        });
    }
}
