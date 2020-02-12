sap.ui.define([], function () {
	"use strict";
	return {
		tileState: function (startAt, endAt) {
			const now = new Date();

			const startAtDate = new Date();
			const endAtDate = new Date();
			
			let [hours, minutes, seconds] = startAt.split(':');
			startAtDate.setHours(+hours);
			startAtDate.setMinutes(minutes);
			startAtDate.setSeconds(seconds);

			[hours, minutes, seconds] = endAt.split(':');
			endAtDate.setHours(+hours);
			endAtDate.setMinutes(minutes);
			endAtDate.setSeconds(seconds);		
			
			return startAtDate >= now && now <= endAtDate ? 'Loaded' : 'Disabled';
		}
	};
});