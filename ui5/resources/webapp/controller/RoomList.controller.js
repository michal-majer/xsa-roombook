sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";


	return Controller.extend("roombook.ui5.controller.RoomList", {
		onNavigateToRoomView: function (oEvent) {
			const oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			const oGridListItem =  oEvent.getSource();
			const { ID } = oGridListItem.getBindingContext().getObject()

			oRouter.navTo("RoomView", {
				roomId: ID
			});			
		}
	});
});