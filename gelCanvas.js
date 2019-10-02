var gelCanvas = (function () {
    var container;
    var canvas;
    var lanetags;
    var weightMarkers;
    var containerHtmlId;
    var canvasHtmlId;

    var settings = {
        canvas: {},
        tagProps: { 
            init: {
                leftOffset: 70, 
                bottomOffset: 100,
                tagDistance: 45, 
            },
            common: {
                angle: -45,
                fill: "#456",
                fontSize: 15,
            }
        },
        markerProps: { 
            init: {
                topOffset: 130,
                markerViewHeight: 400,
            },
            textProps: {
                left: 20,
                fontSize: 15,
                textAlign: "right",
            },
            lineProps: {
                left: 50,
                lineWidth: 40
            }
        },
    };

    function init(containerDivId, markers, tags) {
        containerHtmlId = containerDivId || containerHtmlId;
        container = document.getElementById(containerHtmlId);
        canvasHtmlId = container.getElementsByTagName("canvas")[0];
        if (!canvasHtmlId) {
            console.log("No Canvas element with id found. Exiting.")
            return;
        }
        weightMarkers = markers || weightMarkers || {};
        lanetags = tags || lanetags || [];

        resetCanvas();
    }

    function resetCanvas() {
        if (canvas) canvas.dispose();
        canvas = new fabric.Canvas(canvasHtmlId);

        resizeCanvasToContainer();
        addAllWeightMarkers(weightMarkers);
        addAllLaneTags(lanetags);
        canvas.renderAll();
    }

    function resizeCanvasToContainer() {
        canvas.setWidth(container.clientWidth);
        canvas.setHeight(container.clientHeight);
    }

    function addAllWeightMarkers(weightMarkers) {
        Object.keys(weightMarkers).forEach(molecularWeight => {
            let height = settings.markerProps.init.topOffset + 
                settings.markerProps.init.markerViewHeight * (1 - weightMarkers[molecularWeight]/100);
            
            let markerSettings = Object.assign({top: height}, settings.markerProps.textProps);
            let textObj = new fabric.Text(molecularWeight, markerSettings);

            let leftOffset = settings.markerProps.lineProps.left;
            let coords = [ 
                leftOffset, height + textObj.height/2,
                leftOffset + settings.markerProps.lineProps.lineWidth, height + textObj.height/2
            ];

            let lineObj = new fabric.Line(coords, { stroke: "#777", strokeWidth: 2 });
            canvas.add(new fabric.Group([lineObj, textObj], {lockMovementX: true}));
        });
    }

    function addAllLaneTags(lanetags) {
        let tagSettings = Object.assign({
            left: settings.tagProps.init.leftOffset, 
            top: settings.tagProps.init.bottomOffset,
        }, settings.tagProps.common);
                
        lanetags.forEach(element => {
            tagSettings.fill = element.color;
            tagSettings.left = tagSettings.left + settings.tagProps.init.tagDistance;
            addText(element.text, tagSettings);
        });
    }

    function test() {
        // get 2d context to draw on (the "bitmap" mentioned earlier)
        var ctx = canvas.getContext('2d');

        // set fill color of context
        ctx.fillStyle = 'red';

        // create rectangle at a 100,100 point, with 20x20 dimensions
        ctx.fillRect(10, 10, 20, 20);
        
        // create a rectangle with angle=45
        var rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 20,
            height: 20,
            angle: 45
        });

        canvas.add(rect);
    }

    function getImageDropLocation() {
        return {
            left: settings.tagProps.init.leftOffset, 
            top: settings.markerProps.init.topOffset
        };
    }
 
    function addImageFromElement(divName) {
        var imgElement = document.getElementById(divName);
        var imgInstance = new fabric.Image(imgElement, getImageDropLocation());

        canvas.add(imgInstance);
        canvas.renderAll();
    }

    function addImageFromFile(e) {
        var reader = new FileReader();
        reader.onload = function (event){
            var imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
                var image = new fabric.Image(imgObj);
                image.set(getImageDropLocation());
                canvas.add(image);
                canvas.renderAll();
            }
        }

        reader.readAsDataURL(e.target.files[0]);
    }

    function reset() {
        if (!containerHtmlId) {
            console.log("Canvas was never initialized (with call to 'init').");
            return;
        }
        resetCanvas();
    }

    function addLaneTag(text) {
        var options = {}
        addText();
    }

    function addText(text, options) {
        canvas.add(new fabric.IText(text, options));
    }

    function addCustomText() {
        addText('Your Text', {left: 300, top: 300});
    }

    function handleUploadImageEvent(e) {
        var reader = new FileReader();

        reader.onload = function(event) {
            var imgObject = new Image();
            imgObject.src = event.target.result;
            imgObject.onload = function() {
                var image = new fabric.Image(imgObject);
                addImage(image);
            }
        }

        reader.readAsDataURL(e.target.files[0]);
    }

    function addImage(imgObject){
        imgObject.left = settings.gelImageOffsetX;
        imgObject.top = settings.weightMarkerStartingOffset;
    }

    function addWeightMarker(text, left, top, angle, color) {
        var text = new fabric.text();
    }

    function getCanvas() {
        return canvas;
    }

    function deleteObject() {
        canvas.getActiveObjects().forEach(function (object) {
            canvas.remove(object);
        });
    }

    function duplicate() {
        canvas.getActiveObjects().forEach(function (ob) {
            ob.clone(function (cl) {
                if (cl.left < 0) {
                    cl.left += canvas.getCenter().left;
                    cl.top += canvas.getCenter().top;
                } else {
                    cl.left += 50;
                }
                canvas.add(cl);
            });
        });
    }

    function uploadAsImage(callback) {
        var data = canvas.toDataURL();
        callback(data);
    }

    return {
        init: init,
        reset: reset,
        addLaneTag: addLaneTag,
        addWeightMarker: addWeightMarker,
        addImageFromFile: addImageFromFile,
        addImageFromElement: addImageFromElement,
        getCanvas: getCanvas,
        delete: deleteObject,
        duplicate: duplicate,
        //uploadAsJson: uploadAsJson,
        uploadAsImage: uploadAsImage
    };
})();