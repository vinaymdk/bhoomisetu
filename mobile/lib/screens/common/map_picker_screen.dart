import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../viewmodels/listing_form_view_model.dart';

class MapPickerScreen extends StatelessWidget {
  const MapPickerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<ListingFormViewModel>(context);
    final token = vm.mapboxToken;
    final lat = double.tryParse(vm.latitude.text) ?? 20.5937;
    final lng = double.tryParse(vm.longitude.text) ?? 78.9629;
    final center = LatLng(lat, lng);

    return Scaffold(
      appBar: AppBar(title: const Text('Pick Location')),
      body: token == null
          ? const Center(child: Text('Mapbox token missing. Map view disabled.'))
          : FlutterMap(
              options: MapOptions(
                initialCenter: center,
                initialZoom: lat == 20.5937 ? 4 : 13,
                onTap: (tapPosition, point) async {
                  vm.setCoordinates(point.latitude, point.longitude);
                  await vm.reverseGeocode(point.latitude, point.longitude);
                },
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=$token',
                  userAgentPackageName: 'com.bhoomisetu.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: center,
                      width: 40,
                      height: 40,
                      child: const Icon(Icons.location_pin, size: 40, color: Colors.red),
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}


