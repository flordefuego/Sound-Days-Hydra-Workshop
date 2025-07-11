let hydraCanvas;
hydraCanvas = document.getElementById("myCanvas");
hydraCanvas.width = window.innerWidth;
hydraCanvas.height = window.innerHeight;

var hydra = new Hydra({
  canvas: document.getElementById("myCanvas"),
  detectAudio: false,
  makeGlobal: true,
  numSources: 4,
  numOutputs: 4,
  width: window.innerWidth,
  height: window.innerHeight
});

//from https://hyper-hydra.glitch.me/hydra-text.js
{
    const getHydra = function () {
        const whereami = window.location?.href?.includes("hydra.ojack.xyz")
            ? "editor"
            : window.atom?.packages
            ? "atom"
            : "idk";
        if (whereami === "editor") {
            return window.hydraSynth;
        }
        if (whereami === "atom") {
            return global.atom.packages.loadedPackages["atom-hydra"]
                .mainModule.main.hydra;
        }
        let _h = [
            window.hydraSynth,
            window._hydra,
            window.hydra,
            window.h,
            window.H,
            window.hy
        ].find(h => h?.regl);
        return _h;
    };
    window._hydra = getHydra();
    window._hydraScope = _hydra.sandbox.makeGlobal ? window : _hydra.synth;
}

_hydraScope.srcRelMask = function (tex) {
    if (!tex.hasOwnProperty("src")) return src(tex);
    const w = () =>
        tex.src?.width
            ? tex.src?.width / tex.src?.height
            : tex.src?.videoWidth
            ? tex.src?.videoWidth / tex.src?.videoHeight
            : 0;
    const h = () =>
        tex.src?.height
            ? tex.src?.height / tex.src?.width
            : tex.src?.videoHeight
            ? tex.src?.videoHeight / tex.src?.videoWidth
            : 0;
    const cw = () => _hydra.canvas.clientWidth / _hydra.canvas.clientHeight;
    const ch = () => _hydra.canvas.clientHeight / _hydra.canvas.clientWidth;
    return _hydraScope
        .src(tex)
        .mask(shape(4, 1, 0))
        .scale(
            1,
            () => {
                const _cw = cw();
                const _w = w();
                return _cw > _w ? _w / _cw : 1;
            },
            () => {
                const _ch = ch();
                const _h = h();
                return _ch > _h ? _h / _ch : 1;
            }
        );
};

{
    const Source = _hydra.s[0].constructor;
    window.hydraText = {
        font: "sans-serif",
        fontStyle: "normal",
        fontSize: "auto",
        textAlign: "center",
        fillStyle: "white",
        strokeStyle: "white",
        lineWidth: "2%",
        lineJoin: "miter",
        canvasResize: 2,
        interpolation: "linear"
    };

    function createSource() {
        const s = new Source({
            regl: _hydra.regl,
            pb: _hydra.pb,
            width: _hydra.width,
            height: _hydra.height,
        });
        return s;
    }
    function isPercentage(property){
        return String(property).endsWith("%");
    }
    function getPercentage(property){
        return Number(property.substring(0,property.length-1)) / 100;
    }
    const _text = function (str, _config, fill = true, stroke = false, fillAfter = false) {
        const s = createSource();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const lines = str.split("\n");
        const longestLine = lines.reduce((a,b) => a.length > b.length ? a : b );

        if (typeof _config == "string") _config = { font: _config };

        const config = Object.assign({}, hydraText);
        Object.assign(config, _config);
        const font = config.font;
        config.font = undefined;
        const fontStyle = config.fontStyle;
        config.fontStyle = undefined;
        config.textBaseline = "middle";

        const fontWithSize = (size) => `${fontStyle} ${size} ${font}`;

        Object.assign(ctx, config);

        canvas.width = _hydra.width;
        ctx.font = fontWithSize("1px");
        let padding = _hydra.width / 20;
        let textWidth = _hydra.width - padding;
        let fontSize = textWidth / ctx.measureText(longestLine).width;
        canvas.height = fontSize * 1.4 * lines.length;

        if(isPercentage(config.fontSize)) fontSize *= getPercentage(config.fontSize);
        else if (config.fontSize != "auto") fontSize = Number(config.fontSize.replace(/[^0-9.,]+/, ''));
        if(isPercentage(config.lineWidth)) config.lineWidth = fontSize * getPercentage(config.lineWidth);
        config.fontSize = undefined;
        
        fontSize *= config.canvasResize;
        canvas.width *= config.canvasResize;
        canvas.height *= config.canvasResize;
        textWidth *= config.canvasResize;
        padding *= config.canvasResize;
        config.lineWidth *= config.canvasResize;

        config.font = fontWithSize(String(fontSize) + "px");
        Object.assign(ctx, config);

        let x = 0;
        if (ctx.textAlign == "center") x = canvas.width / 2;
        else if (ctx.textAlign == "left") x = padding / 2;
        else if (ctx.textAlign == "right") x = canvas.width - padding / 2;

        lines.forEach((line, i) => {
            const y = (canvas.height / (lines.length + 1)) * (i + 1);
            if (fill) ctx.fillText(line, x, y, textWidth);
            if (stroke) ctx.strokeText(line, x, y, textWidth);
            if (fillAfter) ctx.fillText(line, x, y, textWidth);
        });

        s.init({ src: canvas }, { min: config.interpolation, mag: config.interpolation });

        return _hydraScope.srcRelMask(s);
    };
    _hydraScope.text = function (str, config) {
        return _text(str, config);
    };
    _hydraScope.strokeText = function (str, config) {
        return _text(str, config, false, true);
    };
    _hydraScope.fillStrokeText = function (str, config) {
        return _text(str, config, true, true, false);
    };
    _hydraScope.strokeFillText = function (str, config) {
        return _text(str, config, false, true, true);
    };
}


hydraText.font = "Comic Sans MS"
hydraText.lineWidth = "2%"
str = "Hydra"
str2 = "workshop"
str3 = "sounddays"


solid()
.layer(text(str).mult(osc(10,0,0.5).saturate(8)).scrollY(-0.03),1)
.layer(text(str))
.layer(text(str2).scale(0.5).scrollY(-0.25).mult(osc()))
.modulateRotate(noise(3,0),0.1)
.modulate(osc(10,0.1).rotate(()=>Math.PI/2))
.modulate(osc(20).modulate(noise(8)),0.01)
.invert()
.layer(text(str3).scale(0.3).scroll(-0.2,-0.3).color(1,0,0).invert([0,1]))
.scrollY(0,-0.1)
.blend(solid().add(noise(1000)),0.4)
.layer(src(o0).scrollY(-0.001).mask(osc(20).modulateScale(noise(3)).thresh(0.5,0)))
.out()