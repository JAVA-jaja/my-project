1. เปิดโปรแกรม Docker Desktop ไว้ 
2. เราต้องสร้าง image ใน docker ก่อน และแยก image ของ backend และ frontend ด้วย
   และในทุกโฟลเดอร์ต้องมี dockerfile (สั่งพี่ชายทำก็ได้)
3. ต้อง sign in ทั้ง docker destop และ docker hub ก่อน ใช้เมลเดียวกันกับ github ก็ได้
4. อยากสร้างของอันไหนก่อน เข้า path อันนั้นก่อน
5. คำสั่งที่ใช้สร้าง image => docker build -t <ชื่อ repo ใน docker hub>/<ชื่อ image>:v1.0.0 .
   (v1.0.0 คือ tag เวอร์ชัน ไม่ฟิกว่าต้องใช้เลขนี้ ส่วน . คือจะ build ไฟล์ทั้งหมด)
6. ชื่อ image ของ frontend และ backend ห้ามซ้ำกันเด็ดขาด!!!!!!
7. ถ้าเผลอ build แล้วอยากเลิก build ใช้คำสั่ง => docker compose down --rmi all
8. build เสร็จ จะ push code ใช้คำสั่ง => docker push <ชื่อ repo ใน docker hub>/<ชื่อ image>:v1.0.0
9. ตอนนี้มันยังใช้ไม่ได้ ก็ใช้คำสั่ง => docker compose up (มี -d หรือไม่มีก็ได้ แล้วแต่)
10. หลังจากนี้ อยาก deploy ที่เว็บไหนก็ทำตามขั้นตอนในเว็บ
