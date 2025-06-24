using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPNumber1.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingBlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MissingBlocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductionLine = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotorType = table.Column<string>(type: "nvarchar(1)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    BlueBlocks = table.Column<int>(type: "int", nullable: false),
                    RedBlocks = table.Column<int>(type: "int", nullable: false),
                    GrayBlocks = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReportedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MissingBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MissingBlocks_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MissingBlocks_OrderId",
                table: "MissingBlocks",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MissingBlocks");
        }
    }
}
