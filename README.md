## TODO:
- DONE ~~Output JSON templates~~
- DONE ~~FileDB metadata: indexing, count~~
- DONE ~~Resources: list and details~~
- TODO ~~Routes: restful list, take in where/params~~
    -  TODO: Implement optional resource schema to handle type in queries
- DONE ~~Sanitize output file name~~
- TODO ~~Take in filename parameter!~~
- DONE ~~Files: Format conversion library. Support CSV, JSON~~
- TODO Error handling
- TODO Uploader: provide html form
- TODO Implement fs ops with file streams
- TODO UI for list/edit resources
- TODO Refine data: Transform streams
- TODO ~~Integrate moment.js into faker module~~

## Template:
Context, gathered from FileDB metadata and results.
* Total count: Number
* Results count: Number
* Action: String
* Action message: String
* Result data: Array|Object
* success: boolean

## Restful:
*NOTE* Right now we do not type check resource objects, so conversions to JSON are left to chance, ie a field containing a number might get parsed as a string. This is OK most of the time, but it could break your `where` queries on the `list` endpoint. This two URLs are not equal:

```
http://localhost:9000/api/athletes?where={"age":23}
```

```
http://localhost:9000/api/athletes?where={"age":"23"}
```

## Resources
- [Browser library][1]
- [File upload][2]
[1]:(http://nytimes.github.io/pourover/)
[2]:(https://github.com/domharrington/fileupload/tree/master/lib)