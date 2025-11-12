# 🌐 Port Forwarding Setup Guide

## ✅ What I've Already Configured

- ✓ Updated `server/.env` with CORS and CLIENT_ORIGIN variables
- ✓ Updated `server/index.js` with proper CORS middleware
- ✓ Updated Socket.IO CORS configuration
- ✓ Updated `client/vite.config.js` to accept external connections
- ✓ Created configuration template for `client/.env`

---

## 📍 STEP 1: Get Your Public IP

Open PowerShell and run:

```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org?format=json").Content | ConvertFrom-Json | Select-Object ip
```

**Example Output:** `203.0.113.45`

**Share this IP with your friend!** 🎉

---

## 📍 STEP 2: Get Your Local PC IP

```powershell
ipconfig | findstr "IPv4 Address"
```

**Example Output:** `192.168.1.100`

Keep this handy for router configuration.

---

## 🔧 STEP 3: Configure Router Port Forwarding

1. **Open router admin panel:** `http://192.168.1.1`
   - Try default credentials: `admin/admin`
   - Check your router model manual if different

2. **Navigate to Port Forwarding** (usually under Advanced → NAT or Port Forwarding)

3. **Create TWO forwarding rules:**

### Rule 1 - Backend
| Setting | Value |
|---------|-------|
| External Port | `5000` |
| Internal Port | `5000` |
| Internal IP | `192.168.1.100` (your PC IP) |
| Protocol | TCP |
| Status | Enable/Active |

### Rule 2 - Frontend
| Setting | Value |
|---------|-------|
| External Port | `5173` |
| Internal Port | `5173` |
| Internal IP | `192.168.1.100` (your PC IP) |
| Protocol | TCP |
| Status | Enable/Active |

4. **Save/Apply** the rules

---

## 🔌 STEP 4: Update Configuration Files

### For Backend (`server/.env`)

Replace `YOUR_PUBLIC_IP` in your `.env` file:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civic-reporting
JWT_SECRET=your-super-secret-jwt-key-here
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
GEMINI_API_KEY=AIzaSyBcqXDJvxUvaZH-RNw2d8sWaVGE9sXh_fc

CLIENT_ORIGIN=http://203.0.113.45:5173
CORS_ORIGIN=http://203.0.113.45:5173
```

**Replace `203.0.113.45` with YOUR actual public IP!**

---

### For Frontend (`client/.env`)

Create a new file `client/.env` with:

```env
VITE_BASE_URL=http://203.0.113.45:5000
```

**Replace `203.0.113.45` with YOUR actual public IP!**

---

## ✅ STEP 5: Start Your Application

### Terminal 1 - Start Backend

```powershell
cd server
npm install  # First time only
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

---

### Terminal 2 - Start Frontend

```powershell
cd client
npm install  # First time only
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

---

## 🌍 STEP 6: Share With Your Friend

Send your friend this link:

```
http://YOUR_PUBLIC_IP:5173

Example: http://203.0.113.45:5173
```

---

## 🧪 Testing Checklist

- [ ] Verify both servers are running
- [ ] Open `http://YOUR_PUBLIC_IP:5173` on your PC
- [ ] Try login/registration
- [ ] Submit a test report
- [ ] Change language (English/Hindi/Marathi)
- [ ] Check admin dashboard
- [ ] Test real-time updates (socket connection)

---

## 🔍 Troubleshooting

### Issue: "Connection Refused"
**Solution:**
- Check if servers are actually running
- Verify port forwarding rules are correct
- Check if your PC's IP is correct in router settings

### Issue: "CORS Error"
**Solution:**
- Make sure your public IP is correctly set in `.env` files
- Restart both backend and frontend servers
- Check server logs for errors

### Issue: "Blank page or 404"
**Solution:**
- Verify `VITE_BASE_URL` is correct in client `.env`
- Check browser console for errors (F12)
- Ensure backend is responding: `http://YOUR_PUBLIC_IP:5000/health`

### Issue: "Socket Connection Failed"
**Solution:**
- Both servers must be running
- Check browser console (F12) for exact error
- Verify CORS settings in `server/index.js`

---

## 🔐 Security Notes

**Before sharing publicly:**

1. ✅ Change `JWT_SECRET` to a strong random string
2. ✅ Keep your public IP private - only share with trusted users
3. ✅ Consider using a VPN for additional security
4. ✅ Monitor server logs for suspicious activity

---

## 📞 Support

If your friend can't connect:

1. **Check if they can reach your IP:**
   ```powershell
   ping YOUR_PUBLIC_IP
   ```

2. **Have them check error console (F12)** for specific error messages

3. **Verify both servers are running:**
   - Backend: `http://YOUR_PUBLIC_IP:5000/health`
   - Frontend: `http://YOUR_PUBLIC_IP:5173`

---

## ⚡ Quick Reference

| Service | Local | External |
|---------|-------|----------|
| Backend | `http://localhost:5000` | `http://YOUR_PUBLIC_IP:5000` |
| Frontend | `http://localhost:5173` | `http://YOUR_PUBLIC_IP:5173` |
| Socket.IO | Auto | Configured via CORS |

---

**Generated:** November 12, 2025  
**Next Steps:** Get your public IP → Configure router → Update `.env` files → Share link with friend!
