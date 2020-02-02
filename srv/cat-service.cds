using roombook from '../db/data-model';

service ApiService {
	@readonly entity Rooms as projection on roombook.Rooms;
	entity Reservations as projection on roombook.Reservations;
}
// service CatalogService {
//     @readonly entity Books as projection on my.Books;
// }
