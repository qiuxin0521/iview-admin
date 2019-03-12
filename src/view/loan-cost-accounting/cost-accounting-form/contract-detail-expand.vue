<template>
  <div>
    <Row class="expand-row">
      <Col span="8">
        <span class="expand-key">运费: </span>
        <span class="expand-value">{{ row.transportCost }}</span>
      </Col>
      <Col span="8">
        <span class="expand-key">装车费: </span>
        <span class="expand-value">{{ row.loadCost }}</span>
      </Col>
      <Col span="8">
        <span class="expand-key">生产厂商: </span>
        <span class="expand-value">{{ row.manufacturer }}</span>
      </Col>
    </Row>
    <Row>
      <Col span="18">
        <span class="expand-key">备注: </span>
        <span class="expand-value">{{ row.remark }}</span>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: 'contract-detail-expand',
  props: {
    row: Object
  }
}
</script>

<style scoped>
  .expand-row{
    margin-bottom: 8px;
  }
</style>
