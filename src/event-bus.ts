import {
	Observable,
	Subject,
	Subscription,
	asyncScheduler,
	defer,
	merge,
} from 'rxjs';
import { finalize, share, takeUntil } from 'rxjs/operators';

export class RxEventBus {
	private _subjectsMap = new Map<any, Subject<any>>();
	private _observablesMap = new Map<any, Observable<any>>();

	private _destroyed = false;

	get destroyed() {
		return this._destroyed;
	}

	private _destroySubject = new Subject<void>();
	private _destroySubscription = new Subscription();

	emitDelayed(delay: number, eventType: any, payload?: any) {
		this._destroySubscription.add(
			asyncScheduler.schedule(() => {
				this.emit(eventType, payload);
			}, delay)
		);
	}

	emit(eventType: any, payload?: any) {
		this._subjectsMap.get(eventType)?.next(payload);
	}

	on<T = any>(...eventTypes: any[]): Observable<T> {
		return defer(() => {
			const observables = eventTypes.map((x) => this._getOrCreateObservable(x));

			let observable: Observable<T>;
			if (observables.length > 1) {
				observable = merge(...observables);
			} else {
				observable = observables[0];
			}

			return observable;
		}).pipe(takeUntil(this._destroySubject));
	}

	destroy() {
		if (!this.destroyed) {
			this._destroyed = true;
			this._destroySubject.next();
			this._destroySubject.complete();
			this._destroySubject.unsubscribe();
			this._destroySubscription.unsubscribe();

			this._subjectsMap.clear();
			this._observablesMap.clear();
		}
	}

	private _getOrCreateObservable(eventType: any): Observable<any> {
		let observable: Observable<any>;
		if (this._observablesMap.has(eventType)) {
			observable = this._observablesMap.get(eventType);
		} else {
			const ref = new WeakRef(this);
			observable = this._getOrCreateSubject(eventType).pipe(
				finalize(() => {
					const self = ref.deref();
					self?._subjectsMap?.delete?.(eventType);
					self?._observablesMap?.delete?.(eventType);
				}),
				share()
			);
			this._observablesMap.set(eventType, observable);
		}

		return observable;
	}

	private _getOrCreateSubject(eventType: any): Subject<any> {
		let subject: Subject<any>;
		if (this._subjectsMap.has(eventType)) {
			subject = this._subjectsMap.get(eventType);
		} else {
			subject = new Subject();
			this._subjectsMap.set(eventType, subject);
		}

		return subject;
	}
}
