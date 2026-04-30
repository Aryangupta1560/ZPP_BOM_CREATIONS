sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {

        // ✅ CREATE NAVIGATION
        onCreate: function () {
            this.getOwnerComponent().getRouter().navTo("RouteCreate");
        },

        // 🔍 FILTER
        onSearch: function () {

            var aFilters = [];

            var sPlant = this.byId("plantFilter").getValue();
            var sMaterial = this.byId("materialFilter").getValue();
            var sUsage = this.byId("usageFilter").getValue();

            if (sPlant) {
                aFilters.push(new Filter("Plant", FilterOperator.Contains, sPlant));
            }

            if (sMaterial) {
                aFilters.push(new Filter("Material", FilterOperator.Contains, sMaterial));
            }

            if (sUsage) {
                aFilters.push(new Filter("BomUsage", FilterOperator.Contains, sUsage));
            }

            var oTable = this.byId("bomTable");
            var oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters);
        },

        // 🗑 DELETE
        onDelete: function () {

            var oTable = this.byId("bomTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Select at least one row");
                return;
            }

            var oModel = this.getView().getModel();

            aSelectedItems.forEach(function (oItem) {

                var oContext = oItem.getBindingContext();
                var sPath = oContext.getPath();

                oModel.remove(sPath, {
                    success: function () {
                        MessageToast.show("Deleted");
                    }
                });

            });
        },

        // ➡ NAVIGATION ICON CLICK
        onNavigate: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sBomId = oContext.getProperty("BomId");

            console.log("Navigate to:", sBomId);
        }

    });
});