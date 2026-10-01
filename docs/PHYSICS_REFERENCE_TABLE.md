# Physics 101: The Mechanics Odyssey — Official Physics Reference Table

This document establishes the authoritative physics specification for all systems, simulations, user interfaces, HUDs, and automated tests across Levels 1 through 8.

---

## 1. Master Physics Reference Table

| Level | Topic | Definition | Authoritative Formula | SI Unit | Dimension | Vector / Scalar | Variables & Parameters | Educational Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | **Distance** | Total path length accumulated along the trajectory | $d = \sum_{k=1}^N \|\vec{r}_k - \vec{r}_{k-1}\|$ | $\text{m}$ (meter) | $[L]$ | Scalar ($d \ge 0$) | $\vec{r}_k$: positions along path | OpenStax Univ Phys Vol 1 §3.1 |
| **L1** | **Displacement (1D)** | Change in position along a single axis | $\Delta x = x_f - x_i$ | $\text{m}$ | $[L]$ | Signed 1D vector | $x_i$: initial pos, $x_f$: final pos | OpenStax Univ Phys Vol 1 §3.1 |
| **L1** | **Displacement (2D)** | Net change in position vector from start to end | $\Delta \vec{r} = \vec{r}_f - \vec{r}_i = (\Delta x, \Delta y)$ | $\text{m}$ | $[L]$ | 2D Vector | $\vec{r}_i, \vec{r}_f$: position vectors | OpenStax Univ Phys Vol 1 §4.1 |
| **L1** | **Displacement Magnitude** | Straight-line distance between initial and final points | $\|\Delta \vec{r}\| = \sqrt{\Delta x^2 + \Delta y^2}$ | $\text{m}$ | $[L]$ | Scalar ($\|\Delta\vec{r}\| \le d$) | $\Delta x, \Delta y$: coordinate changes | OpenStax Univ Phys Vol 1 §4.1 |
| **L1** | **Displacement Angle** | Polar direction of net displacement vector | $\theta = \operatorname{atan2}(\Delta y, \Delta x)$ | $\text{rad}$ / $\text{deg}$ | Dimensionless | Direction | $\Delta x, \Delta y$: coordinate changes | OpenStax Univ Phys Vol 1 §2.2 |
| **L2** | **Average Speed** | Total distance traveled divided by total elapsed time | $v_{\text{avg}} = \frac{d}{\Delta t}$ | $\text{m/s}$ | $[L T^{-1}]$ | Scalar ($v_{\text{avg}} \ge 0$) | $d$: total distance, $\Delta t$: elapsed time | OpenStax Univ Phys Vol 1 §3.1 |
| **L2** | **Average Velocity (1D)** | Displacement divided by elapsed time in 1D | $v_{\text{avg}, x} = \frac{\Delta x}{\Delta t}$ | $\text{m/s}$ | $[L T^{-1}]$ | Signed 1D vector | $\Delta x$: displacement, $\Delta t$: time | OpenStax Univ Phys Vol 1 §3.1 |
| **L2** | **Average Velocity (2D)** | Net displacement vector divided by elapsed time | $\vec{v}_{\text{avg}} = \frac{\Delta \vec{r}}{\Delta t} = \left(\frac{\Delta x}{\Delta t}, \frac{\Delta y}{\Delta t}\right)$ | $\text{m/s}$ | $[L T^{-1}]$ | 2D Vector | $\Delta \vec{r}$: displacement, $\Delta t$: time | OpenStax Univ Phys Vol 1 §4.2 |
| **L3** | **Average Acceleration (1D)** | Rate of change of velocity over time | $a_{\text{avg}} = \frac{\Delta v}{\Delta t} = \frac{v_f - v_i}{\Delta t}$ | $\text{m/s}^2$ | $[L T^{-2}]$ | Signed 1D vector | $v_i, v_f$: velocities, $\Delta t$: time | OpenStax Univ Phys Vol 1 §3.2 |
| **L3** | **Average Acceleration (2D)** | Vector change in velocity over elapsed time | $\vec{a}_{\text{avg}} = \frac{\Delta \vec{v}}{\Delta t} = \frac{\vec{v}_f - \vec{v}_i}{\Delta t}$ | $\text{m/s}^2$ | $[L T^{-2}]$ | 2D Vector | $\vec{v}_i, \vec{v}_f$: velocity vectors | OpenStax Univ Phys Vol 1 §4.3 |
| **L4** | **UARM Velocity-Time** | Final velocity with constant acceleration | $v_f = v_i + a t$ | $\text{m/s}$ | $[L T^{-1}]$ | Signed 1D vector | $v_i$: initial vel, $a$: accel, $t$: time | OpenStax Univ Phys Vol 1 §3.4 |
| **L4** | **UARM Position-Time** | Position under constant acceleration | $\Delta x = v_i t + \frac{1}{2} a t^2$ | $\text{m}$ | $[L]$ | Signed 1D displacement | $v_i$: initial vel, $a$: accel, $t$: time | OpenStax Univ Phys Vol 1 §3.4 |
| **L4** | **UARM Torricelli Equation** | Velocity squared relationship independent of time | $v_f^2 = v_i^2 + 2 a \Delta x$ | $\text{m}^2/\text{s}^2$ | $[L^2 T^{-2}]$ | Scalar relation ($v_f = \pm\sqrt{v_i^2 + 2a\Delta x}$) | $v_i, v_f$: velocities, $a$: accel, $\Delta x$: disp | OpenStax Univ Phys Vol 1 §3.4 |
| **L4** | **UARM Mean Speed Relation** | Displacement as average of initial and final speeds | $\Delta x = \frac{v_i + v_f}{2} t$ | $\text{m}$ | $[L]$ | Signed 1D displacement | $v_i, v_f$: velocities, $t$: time | OpenStax Univ Phys Vol 1 §3.4 |
| **L5** | **Period** | Time required to complete one full cycle | $T = \frac{\Delta t}{N}$ | $\text{s}$ (second) | $[T]$ | Scalar ($T > 0$) | $\Delta t$: total time, $N$: number of cycles | OpenStax Univ Phys Vol 1 §4.4 |
| **L5** | **Frequency** | Number of complete cycles per unit time | $f = \frac{N}{\Delta t} = \frac{1}{T}$ | $\text{Hz}$ ($\text{s}^{-1}$) | $[T^{-1}]$ | Scalar ($f > 0$) | $N$: cycle count, $\Delta t$: time, $T$: period | OpenStax Univ Phys Vol 1 §4.4 |
| **L5** | **Angular Frequency / Speed** | Angular displacement rate in radians per second | $\omega = 2\pi f = \frac{2\pi}{T}$ | $\text{rad/s}$ | $[T^{-1}]$ | Scalar / pseudo-vector | $f$: frequency, $T$: period | OpenStax Univ Phys Vol 1 §10.1 |
| **L6** | **Angular Velocity** | Rate of change of angular position | $\omega = \frac{\Delta \theta}{\Delta t}$ | $\text{rad/s}$ | $[T^{-1}]$ | Signed pseudo-scalar / vector | $\Delta \theta$: angle in radians, $\Delta t$: time | OpenStax Univ Phys Vol 1 §10.1 |
| **L6** | **Tangential / Linear Speed** | Linear speed of a point at radius $r$ on rigid body | $v = r \omega$ | $\text{m/s}$ | $[L T^{-1}]$ | Scalar magnitude ($v \ge 0$) | $r$: radial distance (m), $\omega$: rad/s | OpenStax Univ Phys Vol 1 §10.1 |
| **L7** | **Centripetal Acceleration (v)** | Radial acceleration toward center via linear speed | $a_c = \frac{v^2}{r}$ | $\text{m/s}^2$ | $[L T^{-2}]$ | Scalar magnitude | $v$: tangential speed, $r$: radius | OpenStax Univ Phys Vol 1 §4.4 |
| **L7** | **Centripetal Acceleration ($\omega$)** | Radial acceleration toward center via angular speed | $a_c = r \omega^2$ | $\text{m/s}^2$ | $[L T^{-2}]$ | Scalar magnitude | $r$: radius, $\omega$: angular speed | OpenStax Univ Phys Vol 1 §4.4 |
| **L7** | **Centripetal Accel Vector** | Inward radial acceleration vector | $\vec{a}_c = -\frac{v^2}{r} \hat{r} = -r\omega^2 \hat{r}$ | $\text{m/s}^2$ | $[L T^{-2}]$ | 2D Vector (points to center) | $\hat{r}$: unit vector pointing outwards | OpenStax Univ Phys Vol 1 §4.4 |
| **L7** | **Tangential Velocity Vector** | Velocity vector perpendicular to radius | $\vec{v}_t = \vec{\omega} \times \vec{r} = (-v\sin\theta, v\cos\theta)$ | $\text{m/s}$ | $[L T^{-1}]$ | 2D Vector (tangent to path) | $\theta$: current angle around center | OpenStax Univ Phys Vol 1 §4.4 |
| **L8** | **Centripetal Force (v)** | Net inward force required for circular trajectory | $F_c = \frac{m v^2}{r}$ | $\text{N}$ ($\text{kg}\cdot\text{m/s}^2$) | $[M L T^{-2}]$ | Scalar magnitude | $m$: mass (kg), $v$: speed, $r$: radius | OpenStax Univ Phys Vol 1 §6.3 |
| **L8** | **Centripetal Force ($\omega$)** | Net inward force expressed via angular speed | $F_c = m r \omega^2$ | $\text{N}$ | $[M L T^{-2}]$ | Scalar magnitude | $m$: mass, $r$: radius, $\omega$: angular speed | OpenStax Univ Phys Vol 1 §6.3 |
| **L8** | **Centripetal Force Vector** | Net inward radial force vector | $\vec{F}_c = - \frac{m v^2}{r} \hat{r} = m \vec{a}_c$ | $\text{N}$ | $[M L T^{-2}]$ | 2D Vector (points to center) | $m$: mass, $\vec{a}_c$: centripetal accel | OpenStax Univ Phys Vol 1 §6.3 |

---

## 2. Invariants and Constraints

1. **Distance vs Displacement**: For any trajectory, $d \ge \|\Delta \vec{r}\|$. Equality holds if and only if motion is along a straight line in a constant direction without reversing.
2. **Speed vs Velocity**: Average speed $v_{\text{avg}} \ge \|\vec{v}_{\text{avg}}\|$. Equality holds if and only if $d = \|\Delta \vec{r}\|$.
3. **Deceleration vs Acceleration**: Negative acceleration is not synonymous with deceleration. If $v < 0$ and $a < 0$, the object is accelerating (speeding up in the negative direction). Deceleration strictly means $\frac{d}{dt}\|\vec{v}\| < 0$, which is equivalent to $\vec{v} \cdot \vec{a} < 0$.
4. **Centrifugal Pseudo-Force**: In an inertial reference frame, there is NO outward centrifugal force acting on an object in circular motion. The object simply tends to move in a straight line tangent to the curve due to Newton's First Law (inertia). Inward centripetal force is supplied by physical agents (tension, friction, normal contact).
