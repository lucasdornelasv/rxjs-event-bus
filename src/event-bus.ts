import {
	asyncScheduler,
	defer,
	merge,
	Observable,
	Subject,
	Subscription,
} from 'rxjs';
import { finalize, share, takeUntil } from 'rxjs/operators';

export class RxEventBus implements Disposable {
	private _subjectsMap = new Map<any, Subject<any>>();
	private _observablesMap = new Map<any, Observable<any>>();

	private _disposed = false;

	get disposed() {
		return this._disposed;
	}

	private _disposeSubject = new Subject<void>();

	private _disposeSubscription: Subscription;
	private get disposeSubscription() {
		if (!this._disposeSubscription) {
			this._disposeSubscription = new Subscription();
		}

		return this._disposeSubscription;
	}

	[Symbol.dispose](): void {
		this.dispose();
	}

	dispose() {
		if (!this.disposed) {
			this._disposed = true;
			this._disposeSubject.next();
			this._disposeSubject.complete();
			this._disposeSubject.unsubscribe();
			this._disposeSubscription?.unsubscribe();

			this._subjectsMap.clear();
			this._observablesMap.clear();
		}
	}

	emitDelayed(delay: number, eventType: any, payload?: any) {
		const self = new WeakRef(this);

		this.disposeSubscription.add(
			asyncScheduler.schedule(function () {
				try {
					self.deref().emit(eventType, payload);
				} finally {
					this.unsubscribe();
				}
			}, delay),
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
		}).pipe(takeUntil(this._disposeSubject));
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
				share(),
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
