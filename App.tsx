import React, { useState, useMemo } from 'react';
import { Camera, Ruler, Maximize, Bird, TreePalm, Crop, ZoomIn, Binoculars } from 'lucide-react';

// 鳥類數據庫 (高度以公分為單位)
const BIRD_TYPES = [
  { id: 'small', name: '翠鳥 (小型)', heightCm: 16, color: '#3b82f6' },
  { id: 'medium', name: '小水鴨 (中型)', heightCm: 38, color: '#10b981' },
  { id: 'large', name: '蒼鷺 (大型)', heightCm: 95, color: '#64748b' }
];

const SENSOR_SIZES = {
  ff: { name: 'Full Frame (全片幅)', cropFactor: 1.0, heightMm: 24 },
  apsc: { name: 'APS-C (1.5x)', cropFactor: 1.5, heightMm: 16 }
};

const DIGITAL_CROPS = [
  { value: 1, label: '1x (原圖)' },
  { value: 1.4, label: '1.4x' },
  { value: 2, label: '2x' }
];

// 使用 SVG 包裹 Emoji 以便於精確控制大小與縮放
const BirdEmoji = ({ size }: { size: string | number }) => (
  <svg 
    viewBox="0 0 100 100" 
    style={{ 
      width: 'auto', 
      height: size, 
      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
      aspectRatio: '1/1'
    }}
  >
    <text x="50" y="55" fontSize="80" textAnchor="middle" dominantBaseline="middle">🐦</text>
  </svg>
);

export default function BirdLensSimulator() {
  const [focalLength, setFocalLength] = useState(400); // mm
  const [distance, setDistance] = useState(20); // meters
  const [sensorKey, setSensorKey] = useState<keyof typeof SENSOR_SIZES>('ff');
  const [digitalCrop, setDigitalCrop] = useState(1); // 1x, 1.4x, 2x
  const [selectedBirdId, setSelectedBirdId] = useState('small');

  const selectedBird = BIRD_TYPES.find(b => b.id === selectedBirdId) || BIRD_TYPES[0];
  const sensor = SENSOR_SIZES[sensorKey];

  // 計算邏輯
  const stats = useMemo(() => {
    // 1. 計算等效焦距 (包含感光元件裁切係數 + 數位裁切係數)
    const totalCropFactor = sensor.cropFactor * digitalCrop;
    const equivalentFocalLength = focalLength * totalCropFactor;

    // 2. 計算成像大小 (物體在感光元件上的物理高度)
    const objectHeightMm = selectedBird.heightCm * 10;
    const distanceMm = distance * 1000;
    const physicalImageHeightMm = (focalLength * objectHeightMm) / distanceMm;

    // 3. 計算填充率
    const effectiveSensorHeight = sensor.heightMm / digitalCrop;
    const fillPercentage = (physicalImageHeightMm / effectiveSensorHeight) * 100;
    
    // 4. 計算望遠鏡倍率 (以 50mm 為 1x 基準)
    const magnification = equivalentFocalLength / 50;

    return {
      equivalentFocalLength,
      fillPercentage: Math.min(fillPercentage, 200),
      magnification
    };
  }, [focalLength, distance, sensorKey, selectedBird, digitalCrop, sensor]);

  // UI 上的鳥類顯示高度
  const birdDisplayHeight = `${stats.fillPercentage}%`;
  const isOverfilled = stats.fillPercentage > 100;

  // 取得倍率描述
  const getMagnificationLabel = (mag: number) => {
    if (mag <= 10) return "通用手持雙筒望遠鏡範圍 (8x/10x)";
    if (mag <= 20) return "高倍率雙筒 / 需防手震";
    if (mag <= 60) return "單筒望遠鏡 (Spotting Scope) 低倍端";
    return "單筒望遠鏡 高倍端 / 天文等級";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-700 pb-4">
          <Camera className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">野鳥攝影：焦距與構圖模擬器</h1>
            <p className="text-slate-400 text-sm">視覺化您的鏡頭選擇，避免買錯焦段</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 左側：控制面板 */}
          <div className="lg:col-span-4 space-y-6 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            
            {/* 1. 選擇鳥類 */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-blue-300 uppercase tracking-wider">
                <Bird className="w-4 h-4 mr-2" /> 1. 拍攝目標 (大小)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {BIRD_TYPES.map(bird => (
                  <button
                    key={bird.id}
                    onClick={() => setSelectedBirdId(bird.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedBirdId === bird.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🐦</span>
                      <span>{bird.name}</span>
                    </div>
                    <span className="text-xs font-mono opacity-70">{bird.heightCm}cm</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 感光元件 */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="flex items-center text-sm font-semibold text-purple-300 uppercase tracking-wider">
                <Maximize className="w-4 h-4 mr-2" /> 2. 機身感光元件
              </label>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                {(Object.keys(SENSOR_SIZES) as Array<keyof typeof SENSOR_SIZES>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSensorKey(key)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      sensorKey === key
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {SENSOR_SIZES[key].name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 數位裁切 */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="flex items-center text-sm font-semibold text-pink-300 uppercase tracking-wider">
                <Crop className="w-4 h-4 mr-2" /> 3. 數位裁切 (Crop Mode)
              </label>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                {DIGITAL_CROPS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDigitalCrop(option.value)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      digitalCrop === option.value
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 焦距滑桿 */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm font-semibold text-green-300 uppercase tracking-wider">
                  <Camera className="w-4 h-4 mr-2" /> 4. 鏡頭焦距
                </label>
                <span className="text-xl font-mono text-green-400 font-bold">{focalLength}mm</span>
              </div>
              <input
                type="range"
                min="70"
                max="800"
                step="10"
                value={focalLength}
                onChange={(e) => setFocalLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>70mm</span>
                <span>400mm</span>
                <span>800mm</span>
              </div>
            </div>

            {/* 5. 距離滑桿 */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  <Ruler className="w-4 h-4 mr-2" /> 5. 拍攝距離
                </label>
                <span className="text-xl font-mono text-orange-400 font-bold">{distance}m</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>5m</span>
                <span>50m</span>
                <span>100m</span>
              </div>
            </div>

          </div>

          {/* 右側：模擬視窗與數據 */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 模擬觀景窗 */}
            <div className="relative w-full aspect-[3/2] bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 group">
              
              {/* 背景 */}
              <div className="absolute inset-0 bg-gradient-to-b from-teal-900 to-emerald-950 opacity-50"></div>
              
              {/* 裝飾性背景樹木 */}
              <div className="absolute bottom-0 left-10 text-emerald-800 opacity-40">
                <TreePalm size={120} />
              </div>
              <div className="absolute bottom-10 right-20 text-emerald-800 opacity-30 transform scale-75">
                <TreePalm size={100} />
              </div>

              {/* 格線 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-b border-white/10"></div>
                <div className="border-r border-white/10"></div>
                <div className="border-r border-white/10"></div>
                <div></div>
              </div>

              {/* 鳥類模擬顯示 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="flex flex-col items-center justify-center transition-all duration-300 ease-out"
                  style={{ height: birdDisplayHeight, width: 'auto' }}
                >
                  <BirdEmoji size="100%" />
                  {isOverfilled && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white px-4 py-2 rounded font-bold text-lg animate-pulse whitespace-nowrap z-10 shadow-lg">
                      爆框! (Too Close)
                    </div>
                  )}
                </div>
              </div>

              {/* 觀景窗資訊覆蓋 */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-xs md:text-sm font-mono text-white/80">
                <div>
                  <div className="bg-black/50 px-2 py-1 rounded mb-1 flex items-center gap-2">
                    <span>ISO 800</span>
                    {digitalCrop > 1 && <span className="text-pink-400 font-bold">Crop {digitalCrop}x</span>}
                  </div>
                  <div className="bg-black/50 px-2 py-1 rounded">1/2000</div>
                </div>
                <div className="text-right">
                  <div className="bg-black/50 px-2 py-1 rounded mb-1 text-yellow-400 font-bold">
                    {stats.fillPercentage > 100 ? '>100' : stats.fillPercentage.toFixed(1)}% 畫面高度
                  </div>
                  <div className="bg-black/50 px-2 py-1 rounded">
                   {focalLength}mm @ {distance}m
                  </div>
                </div>
              </div>

              {/* 對焦點 */}
              <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-red-500/60 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute top-1/2 left-0 w-1 h-0.5 bg-red-500/60 -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-0 w-1 h-0.5 bg-red-500/60 -translate-y-1/2"></div>
                <div className="absolute top-0 left-1/2 w-0.5 h-1 bg-red-500/60 -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-0.5 h-1 bg-red-500/60 -translate-x-1/2"></div>
              </div>
            </div>

            {/* 數據分析卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 卡片 1: 焦距與望遠鏡倍率 */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  {/* 等效焦距 */}
                  <div>
                    <div className="text-slate-400 text-xs uppercase mb-1 flex items-center">
                      <ZoomIn className="w-3 h-3 mr-1" />
                      等效視角焦距 (Full Frame Equiv.)
                    </div>
                    <div className="text-2xl font-bold text-white flex items-baseline">
                      {Math.round(stats.equivalentFocalLength)}mm
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col">
                      <span>物理焦段: {focalLength}mm</span>
                      {(sensorKey === 'apsc' || digitalCrop > 1) && (
                        <span className="text-purple-400">
                          (係數: {(sensor.cropFactor * digitalCrop).toFixed(1)}x)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 分隔線 */}
                  <div className="border-t border-slate-600/50"></div>

                  {/* 望遠鏡倍率 (新增功能) */}
                  <div>
                     <div className="text-slate-400 text-xs uppercase mb-1 flex items-center">
                      <Binoculars className="w-3 h-3 mr-1 text-indigo-400" />
                      相當於雙筒望遠鏡倍率
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-xl font-bold text-indigo-300">
                        {stats.magnification.toFixed(1)}x
                      </span>
                      <span className="text-xs text-slate-400">
                        (@50mm標準)
                      </span>
                    </div>
                    <p className="text-xs text-indigo-400/80 mt-1">
                      {getMagnificationLabel(stats.magnification)}
                    </p>
                  </div>
                </div>
                
                {/* 背景裝飾 */}
                <Binoculars className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/5" />
              </div>

              {/* 卡片 2: 構圖建議 */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-xs uppercase mb-1">構圖建議 (Composition)</div>
                <div className="text-sm text-white space-y-2">
                  {stats.fillPercentage < 10 && (
                    <p className="text-red-300 font-medium">❌ 太小了 (主體 &lt; 10%)。建議啟用數位裁切或靠近。</p>
                  )}
                  {stats.fillPercentage >= 10 && stats.fillPercentage < 30 && (
                    <p className="text-yellow-300 font-medium">⚠️ 帶景構圖 (10-30%)。適合展現環境。</p>
                  )}
                  {stats.fillPercentage >= 30 && stats.fillPercentage <= 80 && (
                    <p className="text-green-400 font-medium">✅ 黃金比例 (30-80%)。細節豐富且構圖舒適。</p>
                  )}
                  {stats.fillPercentage > 80 && (
                    <p className="text-orange-400 font-medium">🔍 大特寫 / 爆框 (&gt;80%)。適合頭部特寫。</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}