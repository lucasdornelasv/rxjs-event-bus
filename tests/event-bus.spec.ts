import { RxEventBus } from '../src/event-bus';

let eventBus: RxEventBus;

describe('RxEventBus', () => {
	beforeEach(() => {
		eventBus = new RxEventBus();
	});

	afterEach(() => {
		eventBus.dispose();
	});

	test('Should emit event', (done) => {
		let count = 0;

		eventBus.on('event').subscribe((v) => {
			expect(v).toBe(1);

			++count;
		});

		eventBus.emit('event', 1);

		eventBus.on('event 2').subscribe((v) => {
			expect(v).toBe(2);

			++count;
		});

		eventBus.emit('event 2', 2);

		eventBus.on('event 3').subscribe((v) => {
			expect(v).toBe(3);

			++count;
		});

		eventBus.emit('event 3', 3);

		expect(count).toBe(3);

		done();
	});
});
