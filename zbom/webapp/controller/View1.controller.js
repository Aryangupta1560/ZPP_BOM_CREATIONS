sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/Input",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    MessageToast,
    ValueHelpDialog,
    FilterBar,
    FilterGroupItem,
    Input,
    Filter,
    FilterOperator,
  ) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {
      onContinue: function () {
        var sMatDisplay = this.byId("inpMaterial3").getValue();
        var sMat =
          this._oSelectedMaterial && this._oSelectedMaterial.Product
            ? this._oSelectedMaterial.Product
            : sMatDisplay;

        var sPlantDisplay = this.byId("inpPlant3").getValue();
        var sPlant =
          this._oSelectedPlant && this._oSelectedPlant.Plant
            ? this._oSelectedPlant.Plant
            : sPlantDisplay;

        var sBomUsageDisplay = this.byId("inpBomUsage3").getValue();
        var sBomUsage =
          this._oSelectedBomUsage && this._oSelectedBomUsage.Usage
            ? this._oSelectedBomUsage.Usage
            : sBomUsageDisplay;

        if (!sMatDisplay || !sPlantDisplay || !sBomUsageDisplay) {
          MessageToast.show("Please fill required fields.");
          return;
        }

        var oHeaderData = {
          Material: sMat,
          Plant: sPlant,
          Usage: sBomUsage,
          BomUsage: sBomUsage,
          BomUsageText:
            this._oSelectedBomUsage && this._oSelectedBomUsage.UsageText
              ? this._oSelectedBomUsage.UsageText
              : sBomUsageDisplay,
          MaterialDescription:
            this._oSelectedMaterial &&
            this._oSelectedMaterial.ProductDescription
              ? this._oSelectedMaterial.ProductDescription
              : sMatDisplay,
          PlantDescription:
            this._oSelectedPlant && this._oSelectedPlant.PlantName
              ? this._oSelectedPlant.PlantName
              : sPlantDisplay,
        };

        var oModel = new sap.ui.model.json.JSONModel(oHeaderData);
        this.getOwnerComponent().setModel(oModel, "headerModel");

        this.getOwnerComponent().getRouter().navTo("RouteBOMItem");
      },

      onInit: function () {
        this._oSelectedMaterial = null;
        this._oSelectedPlant = null;
        this._oSelectedBomUsage = null;

        this.byId("inpMaterial3").attachLiveChange(
          function (oEvent) {
            var sCurrentValue = oEvent.getParameter("value");
            if (
              !this._oSelectedMaterial ||
              sCurrentValue !== this._oSelectedMaterial.ProductDescription
            ) {
              this._oSelectedMaterial = null;
            }
          }.bind(this),
        );

        this.byId("inpPlant3").attachLiveChange(
          function (oEvent) {
            var sCurrentValue = oEvent.getParameter("value");
            if (
              !this._oSelectedPlant ||
              sCurrentValue !== this._oSelectedPlant.PlantName
            ) {
              this._oSelectedPlant = null;
            }
          }.bind(this),
        );

        this.byId("inpBomUsage3").attachLiveChange(
          function (oEvent) {
            var sCurrentValue = oEvent.getParameter("value");
            if (
              !this._oSelectedBomUsage ||
              sCurrentValue !== this._oSelectedBomUsage.UsageText
            ) {
              this._oSelectedBomUsage = null;
            }
          }.bind(this),
        );

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteView1")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function () {
        this._resetForm();
      },

      _resetForm: function () {
        this._oSelectedMaterial = null;
        this._oSelectedPlant = null;
        this._oSelectedBomUsage = null;

        this.byId("inpMaterial3").setValue("");
        this.byId("inpPlant3").setValue("");
        this.byId("inpBomUsage3").setValue("");
        this.byId("inpCopyMaterial3").setValue("");
        this.byId("inpCopyPlant3").setValue("");
        this.byId("inpCopyAltBom3").setValue("");
      },

      onCancel: function () {
        this._resetForm();
        sap.m.MessageToast.show("Form cleared");
      },

      onBomUsageValueHelp: function () {
        var that = this;

        var aData = [
          { Usage: "1", UsageText: "Production" },
          { Usage: "2", UsageText: "Engineering/Design" },
          { Usage: "3", UsageText: "Universal" },
          { Usage: "4", UsageText: "Plant Maintenance" },
          { Usage: "5", UsageText: "Sales and Distribution" },
          { Usage: "P", UsageText: "Predictive MRP" },
          { Usage: "S", UsageText: "Service Management" },
        ];

        var oModel = new sap.ui.model.json.JSONModel(aData);

        if (!this._oVHD) {
          this._oVHD = new ValueHelpDialog({
            title: "Select BOM Usage",
            supportMultiselect: false,
            supportRanges: false,
            key: "Usage",
            descriptionKey: "UsageText",

            ok: function (oEvent) {
              var aTokens = oEvent.getParameter("tokens");
              if (aTokens.length > 0) {
                var sUsageKey = aTokens[0].getKey();
                var oSelected = aData.find(function (oItem) {
                  return oItem.Usage === sUsageKey;
                });

                that._oSelectedBomUsage = {
                  Usage: sUsageKey,
                  UsageText: oSelected ? oSelected.UsageText : sUsageKey,
                };

                that
                  .byId("inpBomUsage3")
                  .setValue(that._oSelectedBomUsage.UsageText);
              }
              that._oVHD.close();
            },

            cancel: function () {
              that._oVHD.close();
            },
          });

          var oTable = new sap.m.Table({
            columns: [
              new sap.m.Column({
                header: new sap.m.Label({ text: "Usage" }),
              }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Usage Text" }),
              }),
            ],
          });

          oTable.bindItems({
            path: "/",
            template: new sap.m.ColumnListItem({
              cells: [
                new sap.m.Text({ text: "{Usage}" }),
                new sap.m.Text({ text: "{UsageText}" }),
              ],
            }),
          });

          oTable.setMode("SingleSelectMaster");
          oTable.setIncludeItemInSelection(true);

          oTable.attachSelectionChange(function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oData = oItem.getBindingContext().getObject();

            that._oSelectedBomUsage = {
              Usage: oData.Usage,
              UsageText: oData.UsageText,
            };
            that.byId("inpBomUsage3").setValue(oData.UsageText || oData.Usage);

            that._oVHD.close();
          });

          this._oVHD.setTable(oTable);
          this._oVHD.setModel(oModel);
        }

        this._oVHD.open();
      },

      onMaterialValueHelp: function () {
        var that = this;
        var oFilterBar;

        if (!this._oMatVHD) {
          var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();

            aItems.forEach(function (oItem) {
              var sValue = oItem.getControl().getValue();
              if (sValue) {
                aFilters.push(
                  new Filter(oItem.getName(), FilterOperator.Contains, sValue),
                );
              }
            });

            that._oTable.getBinding("items").filter(aFilters);
          };

          oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
              new FilterGroupItem({
                groupName: "basic",
                name: "Product",
                label: "Product",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
              new FilterGroupItem({
                groupName: "basic",
                name: "ProductDescription",
                label: "Product Description",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
            ],
          });

          this._oTable = new sap.m.Table({
            growing: true,
            growingThreshold: 1000,
            mode: "None",
            columns: [
              new sap.m.Column({
                header: new sap.m.Label({ text: "Product" }),
              }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Product Description" }),
              }),
            ],
          });

          this._oTable.bindItems({
            path: "/ZI_MATERIAL_VH",
            template: new sap.m.ColumnListItem({
              type: "Active",
              cells: [
                new sap.m.Text({ text: "{Product}" }),
                new sap.m.Text({ text: "{ProductDescription}" }),
              ],
            }),
          });

          this._oTable.attachItemPress(function (oEvent) {
            var oData = oEvent
              .getParameter("listItem")
              .getBindingContext()
              .getObject();

            that._oSelectedMaterial = {
              Product: oData.Product,
              ProductDescription: oData.ProductDescription,
            };
            that
              .byId("inpMaterial3")
              .setValue(oData.ProductDescription || oData.Product);
            that._oMatVHD.close();
          });

          this._oMatVHD = new ValueHelpDialog({
            title: "Select Material",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () {
              that._oMatVHD.close();
            },
            cancel: function () {
              that._oMatVHD.close();
            },
          });

          this._oTable.setModel(this.getOwnerComponent().getModel());
          this._oMatVHD.setTable(this._oTable);
        }

        this._oMatVHD.open();
      },

      onPlantValueHelp: function () {
        var that = this;
        var oFilterBar;

        if (!this._oPlantVHD) {
          var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();

            aItems.forEach(function (oItem) {
              var sValue = oItem.getControl().getValue();
              if (sValue) {
                aFilters.push(
                  new Filter(oItem.getName(), FilterOperator.Contains, sValue),
                );
              }
            });

            that._oPlantTable.getBinding("items").filter(aFilters);
          };

          oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
              new FilterGroupItem({
                groupName: "basic",
                name: "Plant",
                label: "Plant",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
              new FilterGroupItem({
                groupName: "basic",
                name: "PlantName",
                label: "Plant Name",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
            ],
          });

          this._oPlantTable = new sap.m.Table({
            growing: true,
            growingThreshold: 20,
            mode: "None",
            columns: [
              new sap.m.Column({ header: new sap.m.Label({ text: "Plant" }) }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Plant Name" }),
              }),
            ],
          });

          this._oPlantTable.bindItems({
            path: "/ZI_plant_vh",
            template: new sap.m.ColumnListItem({
              type: "Active",
              cells: [
                new sap.m.Text({ text: "{Plant}" }),
                new sap.m.Text({ text: "{PlantName}" }),
              ],
            }),
          });

          this._oPlantTable.attachItemPress(function (oEvent) {
            var oData = oEvent
              .getParameter("listItem")
              .getBindingContext()
              .getObject();

            that._oSelectedPlant = {
              Plant: oData.Plant,
              PlantName: oData.PlantName,
            };
            that.byId("inpPlant3").setValue(oData.PlantName || oData.Plant);
            that._oPlantVHD.close();
          });

          this._oPlantVHD = new ValueHelpDialog({
            title: "Select Plant",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () {
              that._oPlantVHD.close();
            },
            cancel: function () {
              that._oPlantVHD.close();
            },
          });

          this._oPlantTable.setModel(this.getOwnerComponent().getModel());
          this._oPlantVHD.setTable(this._oPlantTable);
        }

        this._oPlantVHD.open();
      },
    });
  },
);
