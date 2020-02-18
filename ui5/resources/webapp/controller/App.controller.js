sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function (Controller) {
	"use strict";
	return Controller.extend("roombook.ui5.controller.App", {
        onInit: function() {
              this._setApiOdata();          
        },

        _setApiOdata: function () {
            const oApi = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                operationMode: "Server",
                serviceUrl: "/api/",
            });

            this.getView().setModel(oApi);
        }        

	});
});