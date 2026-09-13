1. เปิดโปรแกรม Docker Desktop ไว้
2. เปิด terminal ใน vs code แนะนำว่าการ run แต่ละครั้ง ถ้าไม่ได้รันด้วย code เดียวกัน ให้แยก terminal
3. เข้า path โฟลเดอร์ Backend
   3.1 เช็คก่อนว่ามี port หรือ docker รันไว้แล้วหรือไม่ => docker ps
   3.2 ถ้าไม่มี รัน => docker compose up -d
   3.3 ถ้ามีให้ down ก่อน => docker compose down -v
4. เข้า pgadmin ด้วย localhost:5050 ข้อมูลการเข้า database อยู่ใน docker-compose.yml
5. เปิด pgadmin ได้แล้ว ให้เข้า path โฟลเดอร์ Backend แล้วรัน => go run ./cmd/migrate
   เป็นการสร้างตารางใน dtb
6. ยิง api ด้วย => go run ./cmd/api (อยู่ port 8080)   
7. รัน frontend ใน path โฟลเดอร์ Frontend=> npm run dev
8. หน้าเว็บอยู่ที่ localhost:5173 ถ้าขี้เกียจก็อป หลังจาก terminal ขึ้นว่ารันผ่าน ให้กด o+enter
