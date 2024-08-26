## INSTALLATION

**With npm:**

```typescript
npm install --save @rxjs-toolkit/eventbus
```

## EXAMPLES

```typescript
import { RxEventBus } from '@rxjs-toolkit/eventbus';

const eventBus = new RxEventBus();

eventBus.on('eventName').subscribe((value: number) => {
	console.log(value);
});

eventBus.emit('eventName', 5);
```

## CONTRIBUTING

We'd love for you to contribute to our source code! We just ask to:

- Write tests for the new feature or bug fix that you are solving
- Ensure all tests pass before send the pull-request (Use: `npm test`)
- Pull requests will not be merged if:
  - has not unit tests
  - reduce the code coverage
  - not passing in the `npm test` task

## LICENSE

Copyright (c) 2024 Lucas Dornelas

Licensed under the MIT license.
