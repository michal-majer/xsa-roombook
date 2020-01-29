namespace roombook;

using { cuid, managed } from '@sap/cds/common';

entity Rooms : cuid {
	name : String;
	seats : Integer;
	reservations : Association to many Reservations on reservations.room = $self;
}

entity Reservations : cuid, managed {
	room : Association to Rooms;
	title : String not null; 
	description : String;
	startAt : DateTime not null;
	endAt : DateTime not null;
}