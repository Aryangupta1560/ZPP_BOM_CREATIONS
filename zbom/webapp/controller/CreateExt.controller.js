sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("bom.app.ext.controller.CreateExt", {

        onInit: function () {
            const oView = this.getView();

            // Attach ENTER key event globally
            oView.addEventDelegate({
                onsapenter: function () {
                    this._handleEnter();
                }.bind(this)
            });
        },

        _handleEnter: async function () {
            try {
                const oExtensionAPI = this.base.getExtensionAPI();

                // Create draft entry
                const oContext = await oExtensionAPI.createDocument();

                if (oContext) {
                    // Navigate to Object Page
                    oExtensionAPI.navigateToContext(oContext);
                }

            } catch (err) {
                console.error("ENTER navigation failed:", err);
            }
        }

    });
});