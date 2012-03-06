var printpdf = {
    pad: function(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        
        return str;
    },
    onLoad: function() {
        // initialization code
        this.initialized = true;
        this.strings     = document.getElementById("pdfsequenceprint-strings");
        this.prefs       = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch).getBranch("extensions.pdfsequenceprint@pdfheeere.");
        this.printCounter = 0;
        this.exporting = false;
    },
    onPrintEnd: function() {
        var utils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
        var kk = 39;
        utils.sendKeyEvent("keydown", kk, kk, 0);
        utils.sendKeyEvent("keypress", kk, kk, 0);
        utils.sendKeyEvent("keyup", kk, kk, 0);
        if (this.printCounter < 150) {
            setTimeout(function (){printpdf.printIt()}, 1000);
        }
    },
    startExport: function(e) {
        this.exporting = true;
        this.printIt();
    },
    stopExport: function(e) {
        this.exporting = false;
    },
    resetCounter: function(e) {
        this.printCounter = 0;
    },
    printIt: function() {
        if (!this.exporting) return;
        /*
          var nsIFilePicker = Components.interfaces.nsIFilePicker;
          var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
          picker.init(window, "Save Document as PDF", nsIFilePicker.modeSave);
          picker.appendFilter("PDF", "*.pdf");
          picker.defaultExtension = "pdf";
          picker.defaultString = content.document.title;
          
          picker.show();
          var filename = picker.file.path;
        */
        var basename = "/tmp/test-pdfsequnenceprint-";
        var filename = basename + this.pad(this.printCounter, 4) + ".pdf";
        this.printCounter++;
        
        var webBrowserPrint = window.content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebBrowserPrint);
        
        var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
            .getService(Components.interfaces.nsIPrintSettingsService);
        
        var printSettings = PSSVC.newPrintSettings;
        
        printSettings.printToFile = true;
        printSettings.toFileName  = filename;
        printSettings.printSilent = true;
        printSettings.paperSizeUnit = Components.interfaces.nsIPrintSettings.kPaperSizeMillimeters;
        printSettings.paperName = "iso_a42";
        printSettings.paperData = "iso_a42_210x297mm";
        printSettings.paperWidth = 200;
        printSettings.paperHeight = 150;
        
        printSettings.marginLeft = 0;
        printSettings.marginRight = 0;
        printSettings.marginTop = 0;
        printSettings.marginBottom = 0;
        printSettings.unwriteableMarginLeft = 0;
        printSettings.unwriteableMarginRight = 0;
        printSettings.unwriteableMarginTop = 0;
        printSettings.unwriteableMarginBottom = 0;
        printSettings.shrinkToFit = true;
        printSettings.printRange = 2; // kRangeFocusFrame = 3
        
        printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;
        
        // Added by bho
        var myPrintPrefs  = printpdf.getPrintingPrefs();
        printSettings.printBGColors   = myPrintPrefs.showBGColor;
        printSettings.printBGImages   = myPrintPrefs.showBGImages;
        
        if(myPrintPrefs.showHeaders === false) {
            //lets hide those ugly default headers
            printSettings.footerStrCenter = '';
            printSettings.footerStrLeft   = '';
            printSettings.footerStrRight  = '';
            printSettings.headerStrCenter = '';
            printSettings.headerStrLeft   = '';
            printSettings.headerStrRight  = '';
        }
        // END: Added by bho
        
        webBrowserPrint.print(printSettings, {
            onProgressChange: function() {},
            onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
                    printpdf.onPrintEnd();
            }
        });
    },
    onToolbarButtonCommand: function(e) {
        // just reuse the function above.  you can change this, obviously!
        printpdf.onMenuItemCommand(e);
    },
    getPrintingPrefs: function (){
        return {
            showBGColor: this.prefs.getBoolPref("print.showBGColors"),
            showBGImages: this.prefs.getBoolPref("print.showBGImages"),
            showHeaders: this.prefs.getBoolPref("print.showHeaders")
        };
    }
    
};
window.addEventListener("load", function(e) { printpdf.onLoad(e); }, false);

/*
COMMANDS

touch .mozilla/firefox/prlyuv8p.extdev/extensions/pdfsequenceprint@heeere.com &&  firefox --no-remote -P extdev
pdftk /tmp/test-pdfsequnenceprint-*.pdf cat output /tmp/out.pdf && acroread /tmp/out.pdf



*/