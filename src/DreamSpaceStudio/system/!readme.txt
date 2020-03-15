The code in this root system folder is the common CORE system functionality shared by both client and server sides.
There is client/server detection to translate some requests, such as 'DS.IO.get()', which is called the same way on
both sides, but contains different underlying implementations to accomplish the same thing.