cd /workspace/node_modules/@amcharts/amcharts5-geodata

ls | grep -E '\.(js|ts|d\.ts)$' \
  | sed -E 's/\.(d\.ts|js|ts)$//' \
  | grep -v 'High' \
  | sort -u \
  | awk '{print $0 ": () => import(\"@amcharts/amcharts5-geodata/json/" $0 ".json\"),"}'
