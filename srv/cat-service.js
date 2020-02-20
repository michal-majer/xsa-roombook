module.exports = cds.service.impl(srv => {
	
	const { Reservations } = cds.entities
	
	srv.before('CREATE', 'Reservations', async (req) => {
		const { room_ID, startAt, endAt } = req.data;
		
		const startAtDate = new Date(startAt);
		const endAtDate = new Date(endAt);
		const now = new Date();		
	
		//Validation #1 - Reservation in the past
		if (startAtDate < now) req.reject(400, 'Unable to book room in the past.');
		
		//Validation #2 - End date after start date
		if (endAtDate < startAtDate) req.reject(400, 'The end time is before the start time.');
		
		//Validation #3 - Room is already booked
		const reservations = await cds.read(Reservations).where({
			'room_ID' :room_ID,
			'startAt': {'>=': startAt },
			'startAt': {'<=': endAt },
			'endAt': { '<=': endAt },
			'endAt': { '>=': startAt }
		});
		if (reservations.length > 0) req.reject(400, 'The room is reserved within this period.');
		
	});

});