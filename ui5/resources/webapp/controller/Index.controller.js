sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library"
], function (Controller, JSONModel, unifiedLibrary) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("roombook.ui5.controller.Index", {
		onInit: function () {
			var oModel = new JSONModel();
			oModel.setData({
				startDate: new Date("2018", "6", "9"),
				types: (function () {
					var aTypes = [];
					for (var key in CalendarDayType) {
						aTypes.push({
							type: CalendarDayType[key]
						});
					}
					return aTypes;
				})(),
				appointments: [{
					title: "Meet John Miller",
					type: CalendarDayType.Type05,
					startDate: new Date("2018", "6", "8", "5", "0"),
					endDate: new Date("2018", "6", "8", "6", "0")
				}]
			});
			this.getView().setModel(oModel);
			
			const oTimeModel = new JSONModel();
			
			oTimeModel.setData({
				currentTime: this._getCurrentTime()
			});
			this.getView().setModel(oTimeModel, "timeModel");
			
			this._changeCurrentTime();
		},
		
		_getCurrentTime: function() {
			const now = new Date();
			return `${now.getHours()}:${('0' +now.getMinutes()).slice(-2)}`;
		},
		
		_changeCurrentTime: function() {
			setTimeout(() => {
				const oTimeModel = this.getView().getModel("timeModel");
				oTimeModel.setProperty("/currentTime", this._getCurrentTime());
				setTimeout(this._changeCurrentTime(), 1000);
			}, 1000);
		}
	});
});