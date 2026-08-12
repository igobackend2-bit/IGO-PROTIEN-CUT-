import 'package:flutter/material.dart';

class TopBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onMenuTap;
  final String? userEmail;
  final VoidCallback onLogout;

  const TopBar({
    super.key,
    required this.title,
    required this.onLogout,
    this.onMenuTap,
    this.userEmail,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: onMenuTap != null
          ? IconButton(icon: const Icon(Icons.menu), onPressed: onMenuTap)
          : null,
      // When no explicit onMenuTap is given, let Flutter auto-detect the
      // enclosing Scaffold's drawer and show the hamburger icon itself —
      // this is what makes the compact-width drawer actually openable.
      automaticallyImplyLeading: onMenuTap == null,
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      actions: [
        PopupMenuButton<String>(
          tooltip: 'Account',
          offset: const Offset(0, 48),
          itemBuilder: (context) => [
            if (userEmail != null)
              PopupMenuItem<String>(
                enabled: false,
                child: Text(userEmail!, style: Theme.of(context).textTheme.bodySmall),
              ),
            const PopupMenuItem<String>(value: 'logout', child: Text('Log out')),
          ],
          onSelected: (value) {
            if (value == 'logout') onLogout();
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  child: Icon(Icons.person, size: 18, color: Theme.of(context).colorScheme.primary),
                ),
                Positioned(
                  right: -1,
                  bottom: -1,
                  child: Container(
                    width: 11,
                    height: 11,
                    decoration: BoxDecoration(
                      color: const Color(0xFF16A34A),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
