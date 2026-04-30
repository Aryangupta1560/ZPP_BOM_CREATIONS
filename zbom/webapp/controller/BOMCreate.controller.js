sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, MessageBox, History) {
    "use strict";

    return Controller.extend("zbom.controller.BOMCreate", {

        onEnter: function () {
            var oModel = this.getView().getModel();
            var that = this;

            var oData = {
                Plant: this.byId("plantInput").getValue().trim(),
                Material: this.byId("materialInput").getValue().trim(),
                MaterialDesc: this.byId("descInput").getValue().trim(),
                BomUsage: this.byId("usageInput").getValue().trim(),
                BaseQty: this.byId("createQtyInput").getValue() || "0",
                BaseUom: this.byId("createUomInput").getValue().trim(),
                ItemText: this.byId("itemTextInput").getValue().trim(),
                ValidFrom: this.byId("validFromInput").getDateValue(), 
                CopyMaterial: this.byId("copyMaterialInput").getValue().trim(),
                CopyPlant: this.byId("copyPlantInput").getValue().trim(),
                CopyAltBom: this.byId("copyAltBomInput").getValue().trim()
            };

            // STRICT VALIDATION: Mandatory fields ke bina page nahi badlega
            if (!oData.Plant || !oData.Material || !oData.ValidFrom) {
                MessageBox.error("Please fill all mandatory fields (Plant, Material, Valid From) and press Enter on an input field.");
                return;
            }

            sap.ui.core.BusyIndicator.show(0);

            oModel.create("/ZC_BOM_HEADER", oData, {
                success: function (oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("BOM Created Successfully!");

                    if (oResponse.BomId) {
                        that.getOwnerComponent().getRouter().navTo("RouteDetail", {
                            BomId: oResponse.BomId
                        });
                    }
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Error creating BOM. Please check your inputs.");
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        }
    });
});