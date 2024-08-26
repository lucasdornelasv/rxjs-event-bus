## INSTALLATION

**With npm:**

```typescript
npm install --save @rxjs-toolkit/filereader
```

## EXAMPLES

```typescript
import { RxFileReader, ProgressEventLike } from '@rxjs-toolkit/filereader';
import { filter, map } from 'rxjs';

let file: File;

RxFileReader.readAsDataURL(file).subscribe((dataUrl: string) => {
	console.log('dataUrl', dataUrl);
});

let file2: File;

RxFileReader.readAsDataURL(file2, true)
	.pipe(
		filter((e: ProgressEventLike<string>) => {
			console.log('Progress', e.loaded);

			return e.completed;
		}),
		map((e) => e.result),
	)
	.subscribe((dataUrl: string) => {
		console.log('dataUrl', dataUrl);
	});
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
